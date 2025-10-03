import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class StaticGeneratorService {
  private readonly logger = new Logger(StaticGeneratorService.name);
  private readonly webhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Smart webhook URL configuration
    // In both development and production: use localhost:3002 (same host, different port)
    // Only override with env var if you have a custom setup
    const defaultUrl = 'http://localhost:3002/regenerate-static';

    this.webhookUrl =
      this.configService.get<string>('STATIC_GENERATOR_WEBHOOK_URL') ||
      defaultUrl;

    this.logger.log(
      `📡 Static generator webhook configured: ${this.webhookUrl}`,
    );
  }

  /**
   * Trigger static page regeneration
   * Called when posts are created, updated, or published
   */
  async triggerRegeneration(reason: string = 'Post updated'): Promise<void> {
    try {
      this.logger.log(`🔄 Triggering static page regeneration: ${reason}`);

      // Make async call to webhook (don't wait for response)
      this.httpService
        .post(this.webhookUrl, {
          reason,
          timestamp: new Date().toISOString(),
        })
        .pipe(
          timeout(5000), // 5 second timeout
          catchError((error) => {
            this.logger.warn(
              `⚠️ Static generator webhook failed: ${error.message}`,
            );
            return of(null); // Don't fail the main operation
          }),
        )
        .subscribe({
          next: (response) => {
            if (response) {
              this.logger.log(
                '✅ Static page regeneration triggered successfully',
              );
            }
          },
          error: (error) => {
            this.logger.warn(
              `⚠️ Static generator webhook error: ${error.message}`,
            );
          },
        });
    } catch (error) {
      this.logger.warn(
        `⚠️ Failed to trigger static regeneration: ${error.message}`,
      );
      // Don't throw - we don't want to fail the main operation
    }
  }

  /**
   * Check if static generator webhook is available
   */
  async isWebhookAvailable(): Promise<boolean> {
    try {
      const response = await this.httpService
        .get(`${this.webhookUrl.replace('/regenerate-static', '/health')}`)
        .pipe(timeout(2000))
        .toPromise();

      return response?.status === 200;
    } catch {
      return false;
    }
  }
}
