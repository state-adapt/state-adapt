import { Observable, of } from 'rxjs';
import { Action } from '../action.interface';
import { getAction } from '../get-action.function';

export type ErrorAction<Err = string> = Action<Err, 'error$'>;
export type ErrorActionWithReq<Req, Err = string> = Action<[Err, Req], 'error$'>;

export function getHttpError<Type extends string>(
  type: Type,
): (err: string) => Observable<ErrorAction>;
export function getHttpError<Type extends string, Req = any>(
  type: Type,
  req: Req,
): (err: string) => Observable<ErrorActionWithReq<Req>>;
export function getHttpError<Type extends string, Req = any>(type: Type, req?: Req) {
  return (err: string) =>
    of(
      req !== undefined
        ? getAction(type, [err, req] as [string, Req])
        : getAction(type, err),
    );
}
