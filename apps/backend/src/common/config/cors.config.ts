import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Logger } from '@nestjs/common';

export interface CorsConfigOptions {
  origins: string[];
  credentials: boolean;
  maxAge: number;
}

export class CorsConfig {
  private static readonly logger = new Logger(CorsConfig.name);

  /**
   * Creates CORS configuration based on environment variables
   */
  static create(): CorsOptions {
    const corsOrigins = process.env.CORS_ORIGINS;
    const corsCredentials = process.env.CORS_ALLOW_CREDENTIALS === 'true';
    const corsMaxAge = parseInt(process.env.CORS_MAX_AGE || '86400', 10);
    const nodeEnv = process.env.NODE_ENV || 'development';

    // Parse origins from environment variable
    let allowedOrigins: string[] | string | boolean = [];

    if (corsOrigins) {
      if (corsOrigins === '*') {
        // Only allow wildcard in development
        if (nodeEnv === 'development') {
          allowedOrigins = true; // This allows all origins
          console.warn('[WARN] CORS: Allowing all origins (development mode)');
        } else {
          throw new Error(
            'CORS wildcard (*) is not allowed in production. Please specify explicit origins in CORS_ORIGINS.',
          );
        }
      } else {
        // Parse comma-separated origins
        allowedOrigins = corsOrigins
          .split(',')
          .map((origin) => origin.trim())
          .filter((origin) => origin.length > 0);

        CorsConfig.logger.log(`Allowing origins: ${allowedOrigins.join(', ')}`);
      }
    } else {
      // Default development origins if none specified
      if (nodeEnv === 'development') {
        allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:4200',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:4200',
        ];
        CorsConfig.logger.log(
          `Using default development origins: ${allowedOrigins.join(', ')}`,
        );
      } else {
        throw new Error(
          'CORS_ORIGINS environment variable is required in production.',
        );
      }
    }

    const corsConfig: CorsOptions = {
      origin: allowedOrigins,
      credentials: corsCredentials,
      maxAge: corsMaxAge,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-HTTP-Method-Override',
      ],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    };

    // Log CORS configuration (without sensitive details)
    CorsConfig.logger.log(`Configuration:`);
    CorsConfig.logger.log(`   - Credentials: ${corsCredentials}`);
    CorsConfig.logger.log(`   - Max Age: ${corsMaxAge}s`);
    CorsConfig.logger.log(`   - Environment: ${nodeEnv}`);

    return corsConfig;
  }

  /**
   * Validates CORS configuration
   */
  static validate(): void {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const corsOrigins = process.env.CORS_ORIGINS;

    // In production, ensure CORS_ORIGINS is set and not wildcard
    if (nodeEnv === 'production') {
      if (!corsOrigins) {
        throw new Error(
          'CORS_ORIGINS environment variable is required in production',
        );
      }

      if (corsOrigins === '*') {
        throw new Error('CORS wildcard (*) is not allowed in production');
      }

      // Validate that all origins are HTTPS in production
      const origins = corsOrigins.split(',').map((origin) => origin.trim());
      const nonHttpsOrigins = origins.filter(
        (origin) =>
          !origin.startsWith('https://') &&
          !origin.startsWith('http://localhost'),
      );

      if (nonHttpsOrigins.length > 0) {
        console.warn(
          `[WARN] CORS: Non-HTTPS origins detected in production: ${nonHttpsOrigins.join(', ')}`,
        );
      }
    }

    // Validate CORS_MAX_AGE
    const corsMaxAge = process.env.CORS_MAX_AGE;
    if (corsMaxAge && isNaN(parseInt(corsMaxAge, 10))) {
      throw new Error('CORS_MAX_AGE must be a valid number');
    }

    CorsConfig.logger.log('CORS configuration validated successfully');
  }
}
