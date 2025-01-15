import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ApiError } from '../helper/ApiError';

@Catch()
export class GlobalErrorHandler implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: HttpException | Error | ApiError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const statusCode = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof ApiError
      ? exception.message
      : 'Internal Server Error';

    this.logger.error({
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      stack: exception.stack,
      statusCode,
    });

    response.status(statusCode).json({
      status: 'error',
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

