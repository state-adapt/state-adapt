import { Action } from '@state-adapt/core';
import { toRequestSource } from './to-request-source.operator';
import { splitSources } from './split-sources.function';
import { Observable } from 'rxjs';

/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `splitRequestSources`

  `splitRequestSources` is a function that takes in the type of [Observable](https://rxjs.dev/guide/observable)
   returned by {@link toRequestSource}, and
  a prefix {@link TypePrefix} to look for in the {@link Action} type, and returns an
  object with two [Observables](https://rxjs-dev.firebaseapp.com/guide/observable) of {@link Action} objects:  `success$`, and `error$`.

  #### Example: Splitting an observable of request actions into success$ and error$ sources

  ```typescript
  import { interval } from 'rxjs';
  import { splitRequestSources } from '@state-adapt/rxjs';

  const interval$ = interval(1000).pipe(
    map(n => n < 2 ? n : n.fakeNumberMethod()),
    toRequestSource('interval'),
  );

  const { success$, error$ } = splitRequestSources('interval', interval$);

  success$.subscribe(console.log);
  // { type: 'interval.success$', payload: 0 }
  // { type: 'interval.success$', payload: 1 }

  error$.subscribe(console.log);
  // { type: 'interval.error$', payload: 'Error: n.fakeNumberMethod is not a function' }
  ```
  */
export function splitRequestSources<
  TypePrefix extends string,
  A extends Action<any, `${TypePrefix}.success$` | `${TypePrefix}.error$`>,
>(
  typePrefix: TypePrefix,
  obs$: Observable<A>,
): {
  success$: Observable<
    A extends Action<infer Payload, `${TypePrefix}.success$`>
      ? Action<Payload, `${TypePrefix}.success$`>
      : never
  >;
  error$: Observable<Action<any, `${TypePrefix}.error$`>>;
} {
  return splitSources(obs$, {
    success$: `${typePrefix}.success$`,
    error$: `${typePrefix}.error$`,
  }) as any;
}
