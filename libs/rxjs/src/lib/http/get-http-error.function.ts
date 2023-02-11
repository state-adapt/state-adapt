import { Action, getAction } from '@state-adapt/core';
import { Observable, of } from 'rxjs';

export type ErrorAction<Err = string> = Action<Err, 'error$'>;
export type ErrorActionWithReq<Req, Err = string> = Action<[Err, Req], 'error$'>;

/**
 * @deprecated Use {@link getAction} instead.
 */
export function getHttpError<Type extends string>(
  type: Type,
): (err: string) => Observable<ErrorAction>;
/**
 * @deprecated Use {@link getAction} instead.
 */
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
