import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorsLoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;
    const nodeEnv = process.env.NODE_ENV || 'development';

    // Only log in development or when there are issues
    if (nodeEnv === 'development' || !this.isAllowedOrigin(origin)) {
      this.logger.log(
        `CORS Request: ${req.method} ${req.url} from origin: ${origin || 'none'}`,
      );
    }

    // Log suspicious requests (those that might be blocked)
    if (origin && !this.isAllowedOrigin(origin)) {
      this.logger.warn(
        `[WARN] CORS: Request from non-allowed origin: ${origin}`,
      );
    }

    next();
  }

  private isAllowedOrigin(origin: string | undefined): boolean {
    if (!origin) return true; // Same-origin requests don't have origin header

    const corsOrigins = process.env.CORS_ORIGINS;
    if (!corsOrigins) return false;

    if (corsOrigins === '*') return true;

    const allowedOrigins = corsOrigins.split(',').map((o) => o.trim());
    return allowedOrigins.includes(origin);
  }
}
