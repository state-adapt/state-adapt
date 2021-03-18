import { concat, Observable, of } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { getAction } from '../get-action.function';
import { splitSources } from '../split-sources.function';
import { getCatchHttpError } from './get-catch-http-error.function';

export function getHttpSources<Res extends { status: number }, Body, Err>(
  feature: string,
  http$: Observable<Res>,
  getResponse: (res: Res) => [boolean, Body, Err],
) {
  const httpWithSources$ = concat(
    of(getAction('Request')),
    http$.pipe(
      map((res) => {
        const [succeeded, body, err] = getResponse(res);
        return succeeded ? getAction('Success', body) : getAction('Error', err);
      }),
      getCatchHttpError('Error'),
      share(),
    ),
  );
  const sources = splitSources(httpWithSources$, {
    request$: 'Request',
    success$: 'Success',
    error$: 'Error',
  });
  return {
    request$: sources.request$.pipe(
      map(({ type }) => ({ type: `${feature} ${type}` })),
    ),
    success$: sources.success$.pipe(
      map(({ type, payload }) => ({ type: `${feature} ${type}`, payload })),
    ),
    error$: sources.error$.pipe(
      map(({ type, payload }) => ({ type: `${feature} ${type}`, payload })),
    ),
  };
}
