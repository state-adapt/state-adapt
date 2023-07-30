import { InjectionToken, inject } from '@angular/core';
import { ReactionsWithSelectors, Selectors } from '../../../../libs/core/src';
import { InitializedSmartStore, SourceArg, StateAdapt } from '../../../../libs/rxjs/src';
import { adapt } from './adapt.function';

export function adaptInjectable<State>(
  path: string,
  initialState: State,
): () => InitializedSmartStore<State>;

// adapt([path, initialState], adapter)
export function adaptInjectable<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
>(
  [path, initialState]: [string, State],
  adapter: R & { selectors?: S },
): () => InitializedSmartStore<State, S, R>;

// adapt([path, initialState], sources);
export function adaptInjectable<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
>(
  [path, initialState]: [string, State],
  sources: SourceArg<State, S, R>,
): () => InitializedSmartStore<State, S, R>;

// adapt([path, initialState, adapter], sources);
export function adaptInjectable<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
>(
  [path, initialState, adapter]: [string, State, R & { selectors?: S }],
  sources: SourceArg<State, S, R>,
): () => InitializedSmartStore<State, S, R>;
/**
  @experimental

  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `adaptInjectable`

  Warning: This is an experimental pattern and may be removed in the future.

  Wraps {@link adapt} and creates an injectable
  Can be called outside of a service or component

  ### Example: Basic adaptInjectable

  ```typescript
  export const injectNameStore = adaptInjectable('name', 'John');

  // ...
  export class AppComponent {
    name$ = injectNameStore().state$;
  }
  ```

  ### Example: adaptInjectable using dependency injection

  ```typescript
  export const injectNameStore = adaptInjectable(['name', 'John', {}], () => {
    // Can inject dependencies here
    const name$ = inject(HttpClient).get<Name>('api/name');
    return name$.pipe(toSource('name$'));
  });

  // ...
  export class AppComponent {
    name$ = injectNameStore().state$;
  }
  ```
  */
export function adaptInjectable(...args: any[]) {
  const path = typeof args[0] === 'string' ? args[0] : args[0][0];
  const token = new InjectionToken(path, {
    providedIn: 'root',
    factory: () => {
      const adaptDep = inject(StateAdapt);
      const store = (adaptDep.adapt as any)(...args);
      return store;
    },
  });
  return () => inject(token);
}
