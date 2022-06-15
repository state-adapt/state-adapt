import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action } from '../action.interface';
import { splitSources } from '../split-sources.function';
import { GetHttpActions } from './get-http-actions.function';

export function splitHttpSources<Res, Body, Err>(
  feature: string,
  httpWithSources$: ReturnType<GetHttpActions<Res, Body, Err>>,
) {
  const sources = splitSources(httpWithSources$, {
    request$: 'request$',
    success$: 'success$',
    error$: 'error$',
  });
  return {
    request$: sources.request$.pipe(prependType(feature)),
    success$: sources.success$.pipe(prependType(feature)),
    error$: sources.error$.pipe(
      map(({ type, payload }) => ({ type, payload })), // Get TypeScript to collapse union of actions to union of payloads
      prependType(feature),
    ),
  };
}

function prependType(prefix: string) {
  return <T>(obs$: Observable<Action<T>>) =>
    obs$.pipe(map(({ type, payload }) => ({ type: `${prefix} ${type}`, payload })));
}
