import { Observable } from 'rxjs';
import { PrefixedAction } from '@state-adapt/core';
import { splitSources } from '../sources/split-sources.function';
import {
  GetHttpActions,
  GetHttpActionsWithReq,
  RequestAction,
  RequestActionVoid,
  SuccessAction,
} from './get-http-actions.function';
import { ErrorAction, ErrorActionWithReq } from './get-http-error.function';
import { prefixSource } from './prefix-source.function';

export type SeparatedHttpSources<Prefix extends string, Body, Err> = {
  request$: Observable<PrefixedAction<Prefix, RequestActionVoid>>;
  success$: Observable<PrefixedAction<Prefix, SuccessAction<Body>>>;
  error$: Observable<PrefixedAction<Prefix, ErrorAction<string | Err>>>;
};
export type SeparatedHttpSourcesWithReq<Prefix extends string, Body, Err, Req> = {
  request$: Observable<PrefixedAction<Prefix, RequestAction<Req>>>;
  success$: Observable<PrefixedAction<Prefix, SuccessAction<Body>>>;
  error$: Observable<PrefixedAction<Prefix, ErrorActionWithReq<Req, string | Err>>>;
};

export function splitHttpSources<Res, Body, Err, Prefix extends string = string>(
  feature: Prefix,
  httpWithSources$: ReturnType<GetHttpActions<Res, Body, Err>>,
): SeparatedHttpSources<Prefix, Body, Err>;
export function splitHttpSources<Res, Body, Err, Req, Prefix extends string = string>(
  feature: Prefix,
  httpWithSources$: ReturnType<GetHttpActionsWithReq<Res, Body, Err, Req>>,
): SeparatedHttpSourcesWithReq<Prefix, Body, Err, Req>;
export function splitHttpSources<Res, Body, Err, Prefix extends string = string>(
  feature: Prefix,
  httpWithSources$: ReturnType<GetHttpActions<Res, Body, Err>>,
): SeparatedHttpSources<Prefix, Body, Err> {
  const sources = splitSources(httpWithSources$, {
    request$: 'request$',
    success$: 'success$',
    error$: 'error$',
  });
  return {
    request$: sources.request$.pipe(prefixSource(feature)),
    success$: sources.success$.pipe(prefixSource(feature)),
    error$: sources.error$.pipe(prefixSource(feature)),
  };
}
