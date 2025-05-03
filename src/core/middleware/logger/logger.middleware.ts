import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '@core/logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}
  use(req: Request, res: Response, next: () => void) {
    if (this.configService.get('NODE_ENV') === 'test') {
      return next();
    }

    res.on('finish', () => {
      const { url, method, protocol } = req;
      const logMessage = `${method} ${url} `;
      const logData = { url, method };
      const { statusCode } = res;
      if (statusCode >= 500) {
        this.logger.error(
          logMessage,
          undefined,
          protocol.toLocaleUpperCase(),
          logData,
        );
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage, protocol.toLocaleUpperCase(), logData);
      } else {
        this.logger.log(logMessage, protocol.toLocaleUpperCase(), logData);
      }
    });
    next();
  }
}
