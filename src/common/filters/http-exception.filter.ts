import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details: string[];
  timestamp: string;
  path: string;
}

//Global HTTP exception filter
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const { message, details } =
      this.normaliseExceptionResponse(exceptionResponse);

    const errorResponse: ErrorResponse = {
      statusCode,
      error: this.getErrorName(statusCode),
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.warn(
      `HTTP ${statusCode} on ${request.method} ${request.url} — ${message}`,
    );

    response.status(statusCode).json(errorResponse);
  }

  private normaliseExceptionResponse(exceptionResponse: unknown): {
    message: string;
    details: string[];
  } {
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const responseObj = exceptionResponse as Record<string, unknown>;
      const rawMessage = responseObj['message'];

      if (Array.isArray(rawMessage)) {
        return {
          message: 'Validation failed',
          details: rawMessage.map(String),
        };
      }

      if (typeof rawMessage === 'string') {
        return {
          message: rawMessage,
          details: [rawMessage],
        };
      }
    }

    if (typeof exceptionResponse === 'string') {
      return {
        message: exceptionResponse,
        details: [exceptionResponse],
      };
    }

    return {
      message: 'An unexpected error occurred',
      details: [],
    };
  }

  private getErrorName(statusCode: number): string {
    const errorNames: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
      [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
      [HttpStatus.BAD_GATEWAY]: 'Bad Gateway',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    };

    return errorNames[statusCode] ?? 'Error';
  }
}
