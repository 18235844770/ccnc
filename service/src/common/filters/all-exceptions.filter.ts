import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const payload = typeof body === 'object' && body !== null ? body : { message: String(body) };
      const message = (payload as { message?: string | string[] }).message;
      const code = (payload as { code?: string }).code;

      response.status(status).json({
        status: 'error',
        message: Array.isArray(message) ? message.join('; ') : message || 'Error',
        ...(code ? { code } : {}),
      });
      return;
    }

    this.logger.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
}
