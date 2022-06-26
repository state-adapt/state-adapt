import { Observable } from 'rxjs';
import {
  getHttpActions,
  GetHttpActionsWithReq,
  GetResponse,
} from './get-http-actions.function';
import {
  SeparatedHttpSources,
  SeparatedHttpSourcesWithReq,
  splitHttpSources,
} from './split-http-sources.function';

export function getHttpSources<Prefix extends string, Res, Body, Err>(
  feature: Prefix,
  http$: Observable<Res>,
  getResponse: GetResponse<Res, Body, Err>,
): SeparatedHttpSources<Prefix, Body, Err>;
export function getHttpSources<Prefix extends string, Res, Body, Err, Req>(
  feature: Prefix,
  http$: Observable<Res>,
  getResponse: GetResponse<Res, Body, Err>,
  req: Req,
): SeparatedHttpSourcesWithReq<Prefix, Body, Err, Req>;
export function getHttpSources<Prefix extends string, Res, Body, Err, Req = any>(
  feature: Prefix,
  http$: Observable<Res>,
  getResponse: GetResponse<Res, Body, Err>,
  req?: Req,
) {
  const httpWithSources$ =
    req !== undefined
      ? getHttpActions<Res, Body, Err, Req>(http$, getResponse, req)
      : getHttpActions<Res, Body, Err>(http$, getResponse);
  return splitHttpSources(
    feature,
    httpWithSources$ as ReturnType<GetHttpActionsWithReq<Res, Body, Err, Req>>,
  );
}
