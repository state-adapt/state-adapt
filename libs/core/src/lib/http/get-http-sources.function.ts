import { Observable } from 'rxjs';
import { splitHttpSources } from './split-http-sources.function';
import { getHttpActions } from './get-http-actions.function';

export function getHttpSources<Res, Body, Err>(
  feature: string,
  http$: Observable<Res>,
  getResponse: (res: Res) => [boolean, Body, Err],
) {
  const httpWithSources$ = getHttpActions<Res, Body, Err>(http$, getResponse);
  return splitHttpSources(feature, httpWithSources$);
}
