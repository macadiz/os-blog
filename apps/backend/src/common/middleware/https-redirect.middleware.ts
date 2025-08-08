import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpsRedirectMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpsRedirectMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Check if request is not HTTPS
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';

    if (!isHttps) {
      const httpsUrl = `https://${req.headers.host}${req.url}`;

      this.logger.log(`Redirecting HTTP to HTTPS: ${req.url} -> ${httpsUrl}`);

      return res.redirect(301, httpsUrl);
    }

    next();
  }
}
