import { interval, Observable } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { Action, getAction } from '@state-adapt/core';
import { Source } from './source';

/**
  `splitSources` is a function that takes in an [Observable](https://rxjs.dev/guide/observable) that emits multiple types of {@link Action} objects and splits it into a source for each {@link Action} type.
  It takes two arguments:
  - `source$`: [Observable](https://rxjs.dev/guide/observable)<{@link CommonAction}>
  - `aliases?`: {@link Aliases} extends { [index: string]: {@link CommonType} } — An optional object with keys that will become the new source names,
  and values that will filter against the `type` property of the actions from the `source$` observable.

  It returns a proxy object that defines keys from the source types and the `aliases` argument (if provided),
  and values of type [Observable](https://rxjs.dev/guide/observable)<{@link Action}<`Payload`, `Type`>>
  where `Payload` and `Type` are inferred from the filtered `CommonAction` type.

  If the source type is specific (as in `'even$' | 'odd$'`), the returned object will have `'even$'` and `'odd$'` properties.
  If the source type is just a string, any string can be accessed, and {@link splitSources} will filter against that string.
  The proxy defines this filtered source once the property is accessed.

  #### Example: Splitting a source into multiple sources

  ```typescript
  import { getAction } from '@state-adapt/core';
  import { splitSources } from '@state-adapt/rxjs';
  import { interval, map } from 'rxjs';

  const evenAndOdd$ = interval(1000).pipe(
    map(n => ({
      // type has to be 'even$' | 'odd$', not just a string
      type: n % 2 === 0 ? ('even$' as const) : ('odd$' as const),
      payload: n,
    })),
  );

  evenAndOdd$.subscribe(console.log);
  // { type: 'even$', payload: 0 }
  // { type: 'odd$', payload: 1 }
  // { type: 'even$', payload: 2 }
  // { type: 'odd$', payload: 3 }

  const { even$, odd$ } = splitSources(evenAndOdd$);

  even$.subscribe(console.log);
  // { type: 'even$', payload: 0 }
  // { type: 'even$', payload: 2 }

  odd$.subscribe(console.log);
  // { type: 'odd$', payload: 1 }
  // { type: 'odd$', payload: 3 }
  ```

  #### Example: Splitting an HTTP source using aliases

  ```typescript
  import { getAction } from '@state-adapt/core';
  import { toSource, splitSources } from '@state-adapt/rxjs';
  import { ajax } from 'rxjs/ajax';

  const http$ = ajax('https://jsonplaceholder.typicode.com/todos/1').pipe(
    map(res => ({ type: 'todos.success$' as const, payload: res })),
    catchError(error => of({ type: 'todos.error$' as const, payload: error })),
  );

  const { success$, error$ } = splitSources(http$, {
    success$: 'todos.success$',
    error$: 'todos.error$',
  });

  success$.subscribe(console.log);
  // { type: 'success$', payload: { ... } }

  error$.subscribe(console.log);
  // { type: 'error$', payload: { ... } }
  ```
 */
export function splitSources<
  CommonAction extends { type: string },
  Aliases extends { [index: string]: keyof ActionMap<CommonAction> },
>(
  source$: Observable<CommonAction>,
  partitions?: Aliases,
): {
  [K in string extends keyof Aliases
    ? never
    : keyof Aliases]: ActionMap<CommonAction>[Aliases[K]];
} & ActionMap<CommonAction> {
  const shared$ = source$.pipe(share()); // Each and every filtered source would cause everything upstream to run for iteslf

  const sources = {} as any;

  // Proxy enables optional partitions object
  // Observable is defined as accessed, restricted to possible types
  return new Proxy({} as any, {
    get: (_, name: string) => {
      const type = (partitions && partitions[name as keyof Aliases]) ?? name;
      const typeSource$ =
        sources[type] ?? (sources[type] = shared$.pipe(filter(val => val.type === type)));
      return typeSource$;
    },
  });
}

// Helper type to split unions in the 'type' property
export type SplitAction<A> = A extends { type: infer T; payload: infer P }
  ? T extends any
    ? { type: T; payload: P }
    : never
  : A extends { type: infer T }
  ? T extends any
    ? { type: T }
    : never
  : never;

// Apply the helper type to all actions
export type SplitActions<U> = U extends any ? SplitAction<U> : never;

// Mapped type to transform the union into an object
export type ActionMap<U extends { type: string }> = {
  [K in SplitActions<U>['type']]: Observable<Extract<SplitActions<U>, { type: K }>>;
};
