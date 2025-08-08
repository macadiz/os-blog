import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { CorsConfig } from './common/config/cors.config';
import { ProductionConfig } from './common/config/production.config';

async function bootstrap() {
  // Validate configurations before creating the app
  try {
    CorsConfig.validate();
    ProductionConfig.validate();
  } catch (error) {
    console.error('[ERROR] Configuration Error:', error.message);
    process.exit(1);
  }

  // Create NestJS application with custom logger configuration
  const app = await NestFactory.create(AppModule, {
    logger: ProductionConfig.getLogLevel(),
  });

  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('/api');

  // Configure trust proxy if enabled
  if (ProductionConfig.shouldTrustProxy()) {
    const trustProxyConfig = ProductionConfig.getTrustProxyConfig();
    app.getHttpAdapter().getInstance().set('trust proxy', trustProxyConfig);
    logger.log(`[OK] Trust proxy enabled: ${trustProxyConfig}`);
  }

  // Enable global validation with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );

  // Configure CORS
  const corsOptions = CorsConfig.create();
  app.enableCors(corsOptions);
  logger.log('[OK] CORS configured successfully');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(
    `[STARTUP] Application is running on: http://localhost:${port}/api`,
  );

  // Log production features status
  if (ProductionConfig.shouldForceHttps()) {
    logger.log('[SECURITY] HTTPS redirection is enabled');
  }
  if (ProductionConfig.shouldTrustProxy()) {
    logger.log('[PROXY] Proxy trust is enabled');
  }
  logger.log(`[CONFIG] Log level: ${process.env.LOG_LEVEL || 'log'}`);
}

void bootstrap();
