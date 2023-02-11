import { Observable } from 'rxjs';
import { filter, share } from 'rxjs/operators';
import { Action } from '@state-adapt/core';
import { Source } from './source';

/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `splitSources`

  `splitSources` is a function that takes in a {@link Source} that emits many kinds of actions and splits it into multiple sources.
  It takes two arguments:
  - `source$`: [Observable](https://rxjs.dev/guide/observable)<{@link SharedAction}>
  - `partitions`: {@link PartitionKeys} extends { [index: string]: {@link SharedType} } — An object with keys that will become the new source names, and values that will filter against the `type` property of the actions from the `source$` observable.

  It returns an object with keys from the `partitions` argument and values of type [Observable](https://rxjs.dev/guide/observable)<{@link Action}<`Payload`, `Type`>> where `Payload` and `Type` are inferred from
  the filtered `SharedAction` type.

  #### Example: Splitting a source into multiple sources

  ```typescript
  import { getAction } from '@state-adapt/core';
  import { splitSources } from '@state-adapt/rxjs';
  import { interval, map } from 'rxjs';

  const evenAndOdd$ = interval(1000).pipe(map(n => {
    const type = n % 2 === 0 ? 'even$' : 'odd$';
    return getAction(type, n);
  }));

  eventAndOdd$.subscribe(console.log);
  // { type: 'even$', payload: 0 }
  // { type: 'odd$', payload: 1 }
  // { type: 'even$', payload: 2 }
  // { type: 'odd$', payload: 3 }

  const { even$, odd$ } = splitSources(evenAndOdd$, {
    even$: 'even$',
    odd$: 'odd$',
  });

  even$.subscribe(console.log);
  // { type: 'even$', payload: 0 }
  // { type: 'even$', payload: 2 }

 odd$.subscribe(console.log);
  // { type: 'odd$', payload: 1 }
  // { type: 'odd$', payload: 3 }
  ```

  #### Example: Splitting an HTTP source into success$ and error$ sources

  ```typescript
  import { getAction } from '@state-adapt/core';
  import { toSource, splitSources } from '@state-adapt/rxjs';
  import { ajax } from 'rxjs/ajax';

  const http$ = ajax('https://jsonplaceholder.typicode.com/todos/1').pipe(
    toSource('success$'),
    catchError(error => of(getAction('error$', error))),
  );

  const { success$, error$ } = splitSources(http$, {
    success$: 'success$',
    error$: 'error$',
  });

  success$.subscribe(console.log);
  // { type: 'success$', payload: { ... } }

  error$.subscribe(console.log);
  // { type: 'error$', payload: { ... } }
  ```
 */
export function splitSources<
  SharedType extends string,
  SharedAction extends { type: SharedType },
  PartitionKeys extends { [index: string]: SharedType },
>(
  source$: Observable<SharedAction>,
  partitions: PartitionKeys,
): {
  [SK in keyof PartitionKeys]: Observable<
    SharedAction extends Record<'type', PartitionKeys[SK]> ? SharedAction : never
  >;
} {
  // TODO: Add overload that takes in an array instead of an object
  // TODO: Write tests for this function
  const shared$ = source$.pipe(share()); // Each and every filtered source would cause everything upstream to run for iteslf
  return Object.entries(partitions).reduce(
    (sources, [name, type]) => ({
      ...sources,
      [name]: shared$.pipe(filter(val => val.type === type)),
    }),
    {} as any,
  );
}
