import { Observable } from 'rxjs';
import { Action } from '@state-adapt/core';
import { toRequestSource } from './to-request-source.operator';
import { splitRequestSources } from './split-request-sources.function';

/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `getRequestSources`

  `getRequestSources` is a function that combines the functionality of {@link toRequestSource} and {@link splitRequestSources}.

  `getRequestSources` takes in an [Observable](https://rxjs.dev/guide/observable) and an {@link Action} type prefix
  {@link TypePrefix} and splits the observable into two sources
  that become available as properties on the returned object as `success$` and `error$`.

  #### Example: Converting an observable into success$ and error$ sources

  ```typescript
  import { interval } from 'rxjs';
  import { getRequestSources } from '@state-adapt/rxjs';

  const interval$ = interval(1000).pipe(map(n => n < 2 ? n : n.fakeNumberMethod()));

  const { success$, error$ } = getRequestSources('interval', interval$);

  success$.subscribe(console.log);
  // { type: 'interval.success$', payload: 0 }
  // { type: 'interval.success$', payload: 1 }

  error$.subscribe(console.log);
  // { type: 'interval.error$', payload: 'Error: n.fakeNumberMethod is not a function' }
  ```

  #### Example: Conveniently splitting an HTTP source into success$ and error$ sources

  ```typescript
  import { getAction } from '@state-adapt/core';
  import { toSource, getRequestSources } from '@state-adapt/rxjs';
  import { ajax } from 'rxjs/ajax';

  const http$ = ajax('https://jsonplaceholder.typicode.com/todos/1');

  const httpRequest = getRequestSources('http', http$);

  httpRequest.success$.subscribe(console.log);
  // { type: 'success$', payload: { ... } }

  httpRequest.error$.subscribe(console.log);
  // { type: 'error$', payload: { ... } }
  ```
 */
export function getRequestSources<TypePrefix extends string, Payload>(
  typePrefix: TypePrefix,
  obs$: Observable<Payload>,
): {
  success$: Observable<Action<Payload, `${TypePrefix}.success$`>>;
  error$: Observable<Action<any, `${TypePrefix}.error$`>>;
} {
  const requestSources = obs$.pipe(toRequestSource(typePrefix));
  return splitRequestSources(typePrefix, requestSources);
}
