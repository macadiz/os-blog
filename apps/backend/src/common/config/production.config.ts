import { Logger } from '@nestjs/common';

export class ProductionConfig {
  private static readonly logger = new Logger('ProductionConfig');

  /**
   * Validates production configuration
   */
  static validate(): void {
    const forceHttps = process.env.FORCE_HTTPS;
    const trustProxy = process.env.TRUST_PROXY;
    const logLevel = process.env.LOG_LEVEL;

    // Validate FORCE_HTTPS
    if (forceHttps && !['true', 'false'].includes(forceHttps.toLowerCase())) {
      throw new Error(
        `Invalid FORCE_HTTPS value: "${forceHttps}". Must be "true" or "false".`,
      );
    }

    // Validate TRUST_PROXY
    if (trustProxy && !['true', 'false'].includes(trustProxy.toLowerCase())) {
      throw new Error(
        `Invalid TRUST_PROXY value: "${trustProxy}". Must be "true" or "false".`,
      );
    }

    // Validate LOG_LEVEL
    const validLogLevels = ['error', 'warn', 'log', 'debug', 'verbose'];
    if (logLevel && !validLogLevels.includes(logLevel.toLowerCase())) {
      throw new Error(
        `Invalid LOG_LEVEL value: "${logLevel}". Must be one of: ${validLogLevels.join(', ')}.`,
      );
    }

    this.logger.log('[OK] Production configuration validated successfully');
  }

  /**
   * Check if HTTPS redirection should be enforced
   */
  static shouldForceHttps(): boolean {
    return process.env.FORCE_HTTPS?.toLowerCase() === 'true';
  }

  /**
   * Check if proxy should be trusted
   */
  static shouldTrustProxy(): boolean {
    return process.env.TRUST_PROXY?.toLowerCase() === 'true';
  }

  /**
   * Get the configured log level
   */
  static getLogLevel(): ('log' | 'warn' | 'error' | 'debug' | 'verbose')[] {
    const logLevel = process.env.LOG_LEVEL?.toLowerCase() || 'log';

    // NestJS log levels hierarchy
    const logLevels: Record<
      string,
      ('log' | 'warn' | 'error' | 'debug' | 'verbose')[]
    > = {
      error: ['error'],
      warn: ['error', 'warn'],
      log: ['error', 'warn', 'log'],
      debug: ['error', 'warn', 'log', 'debug'],
      verbose: ['error', 'warn', 'log', 'debug', 'verbose'],
    };

    return logLevels[logLevel] || logLevels.log;
  }

  /**
   * Get trust proxy configuration for Express
   */
  static getTrustProxyConfig(): boolean | number {
    if (!this.shouldTrustProxy()) {
      return false;
    }

    // Trust first proxy by default
    // In production, you might want to be more specific:
    // - Use specific IP addresses
    // - Use number of proxies
    // - Use 'loopback' for localhost proxies
    return 1;
  }
}
