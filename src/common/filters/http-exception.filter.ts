import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { CreatorNotFoundError } from '../errors/creator-not-found.error';
import { UserNotFoundError } from '../errors/user-not-found.error';

interface ErrorBody {
  status: number;
  code: string;
  message: string;
}

const VALIDATION_ERROR: ErrorBody = {
  status: 400,
  code: 'VALIDATION_ERROR',
  message: 'Requisição inválida.',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const { status, code, message } = this.toErrorBody(exception);
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({ error: { code, message } });
  }

  private toErrorBody(exception: unknown): ErrorBody {
    if (exception instanceof CreatorNotFoundError) {
      return {
        status: 404,
        code: 'CREATOR_NOT_FOUND',
        message: 'Criadora não encontrada.',
      };
    }
    if (exception instanceof UserNotFoundError) {
      return {
        status: 404,
        code: 'USER_NOT_FOUND',
        message: 'Usuário não encontrado.',
      };
    }
    if (exception instanceof HttpException) {
      if (exception.getStatus() === 400) {
        return VALIDATION_ERROR;
      }
      if (exception.getStatus() === 404) {
        return {
          status: 404,
          code: 'NOT_FOUND',
          message: 'Recurso não encontrado.',
        };
      }
    } else if (this.isMalformedBody(exception)) {
      return VALIDATION_ERROR;
    }
    this.logger.error(
      `Unhandled error: ${exception instanceof Error ? exception.message : String(exception)}`,
      exception instanceof Error ? exception.stack : undefined,
    );
    return {
      status: 500,
      code: 'INTERNAL_ERROR',
      message: 'Erro interno.',
    };
  }

  private isMalformedBody(exception: unknown): boolean {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'status' in exception &&
      typeof exception.status === 'number' &&
      exception.status >= 400 &&
      exception.status <= 499
    );
  }
}
