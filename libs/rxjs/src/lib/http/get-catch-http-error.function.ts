import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorAction, ErrorActionWithReq, getHttpError } from './get-http-error.function';
import { catchErrorSource } from '../sources/catch-error-source.operator';

/**
 * @deprecated Use {@link catchErrorSource} instead.
 */
export function getCatchHttpError<Type extends string>(
  type: Type,
): <T>(obs$: Observable<T>) => Observable<T | ErrorAction<string>>;
/**
 * @deprecated Use {@link catchErrorSource} instead.
 */
export function getCatchHttpError<Type extends string, Req = any>(
  type: Type,
  req: Req,
): <T>(obs$: Observable<T>) => Observable<T | ErrorActionWithReq<Req, string>>;
export function getCatchHttpError<Type extends string, Req = any>(type: Type, req?: Req) {
  return <T>(obs$: Observable<T>) =>
    req !== undefined
      ? obs$.pipe(catchError(getHttpError(type, req))) // catchError doesn't like union types
      : obs$.pipe(catchError(getHttpError(type)));
}
