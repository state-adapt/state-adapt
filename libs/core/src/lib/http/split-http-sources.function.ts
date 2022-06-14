import { map } from 'rxjs/operators';
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
    request$: sources.request$.pipe(map(({ type }) => ({ type: `${feature} ${type}` }))),
    success$: sources.success$.pipe(
      map(({ type, payload }) => ({ type: `${feature} ${type}`, payload })),
    ),
    error$: sources.error$.pipe(
      map(({ type, payload }) => ({ type: `${feature} ${type}`, payload })),
    ),
  };
}
