import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { getHttpError } from './get-http-error.function';

export function getCatchHttpError<Type extends string>(type: Type) {
  return <T>(obs$: Observable<T>) => obs$.pipe(catchError(getHttpError(type)));
}
