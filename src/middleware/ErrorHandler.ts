import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { ApiError } from '../helper/ApiError';

/**
 * The GlobalErrorHandler class is a centralized exception filter in a NestJS application.
 * It catches and processes all exceptions thrown during the application's execution, 
 * providing a consistent format for error responses and logging.
 *
 * What it does:
 * - Determines the appropriate HTTP status code based on the type of exception.
 * - Logs detailed error information, including a timestamp, the request path, 
 *   the error message, the stack trace, and the status code, using a logger.
 * - Returns a standardized JSON response to the client containing:
 *   - `status`: Indicates the response is an error.
 *   - `message`: The error message or a generic internal server error message.
 *   - `timestamp`: The time when the error occurred.
 *   - `path`: The URL path of the request that caused the error.
 *
 * This class ensures a consistent and secure error-handling mechanism across the application.
 */

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
      : HttpStatus.INTERNAL_SERVER_ERROR;

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

