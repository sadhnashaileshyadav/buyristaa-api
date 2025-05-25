import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, map, Observable, throwError } from 'rxjs';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;
    return next.handle().pipe(
      map(
        (data) => ({
          statusCode: statusCode,
          message: 'Success',
          data,
        }),
        catchError((err) => {
          const statusCode =
            err instanceof HttpException ? err.getStatus() : 500;
          const errorResponse = {
            statusCode,
            message: err.message || 'Internal server error',
            data: {},
          };
          return throwError(() => new HttpException(errorResponse, statusCode));
        }),
      ),
    );
  }
}
