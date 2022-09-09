import { getAction } from '@state-adapt/core';
import { concat, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { getCatchHttpError } from './get-catch-http-error.function';
import { ErrorAction, ErrorActionWithReq } from './get-http-error.function';

export type GetResponse<Res, Body, Err> = (res: Res) => [boolean, Body, Err];
export type RequestActionVoid = {
  type: 'request$';
  payload: void;
};
export type RequestAction<Req> = {
  type: 'request$';
  payload: Req;
};
export type SuccessAction<Body> = {
  type: 'success$';
  payload: Body;
};

// For TypeScript 4.7 (Angular 14) this will be unnecessary as `typeof functionName<Generic>`
// will be supported. See https://stackoverflow.com/a/64840774/4906280
export interface GetHttpActions<Res, Body, Err> {
  (http$: Observable<Res>, getResponse: GetResponse<Res, Body, Err>): Observable<
    RequestActionVoid | SuccessAction<Body> | ErrorAction<Err | string>
  >;
}
export interface GetHttpActionsWithReq<Res, Body, Err, Req> {
  (
    http$: Observable<Res>,
    getResponse: GetResponse<Res, Body, Err>,
    req: Req,
  ): Observable<
    RequestAction<Req> | SuccessAction<Body> | ErrorActionWithReq<Req, Err | string>
  >;
}

export function getHttpActions<Res, Body, Err>(
  ...[http$, getResponse]: Parameters<GetHttpActions<Res, Body, Err>>
): ReturnType<GetHttpActions<Res, Body, Err>>;
export function getHttpActions<Res, Body, Err, Req = any>(
  ...[http$, getResponse, req]: Parameters<GetHttpActionsWithReq<Res, Body, Err, Req>>
): ReturnType<GetHttpActionsWithReq<Res, Body, Err, Req>>;
export function getHttpActions<Res, Body, Err, Req = any>(
  ...[http$, getResponse, req]:
    | Parameters<GetHttpActions<Res, Body, Err>>
    | Parameters<GetHttpActionsWithReq<Res, Body, Err, Req | undefined>>
):
  | ReturnType<GetHttpActions<Res, Body, Err>>
  | ReturnType<GetHttpActionsWithReq<Res, Body, Err, Req | undefined>> {
  const x$ = concat(
    of(getAction('request$', req)),
    http$.pipe(
      map(res => {
        const [succeeded, body, err] = getResponse(res);
        return succeeded ? getAction(`success$`, body) : getAction(`error$`, [err, req]);
      }),
      getCatchHttpError('error$', req),
    ),
  );
  const y$ = concat(
    of(getAction('request$')),
    http$.pipe(
      map(res => {
        const [succeeded, body, err] = getResponse(res);
        return succeeded ? getAction(`success$`, body) : getAction(`error$`, err);
      }),
      getCatchHttpError('error$'),
    ),
  );
  const z$ = req !== undefined ? x$ : y$;
  return z$ as any; // Something weird happens with the merging of the types, but z$ looks fine
}
