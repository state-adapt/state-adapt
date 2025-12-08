import { InjectionToken, inject } from '@angular/core';
import { ReactionsWithSelectors, Selectors, getId } from '@state-adapt/core';
import {
  AdaptOptions,
  InitializedSmartStore,
  NotAdaptOptions,
  SourceArg,
} from '@state-adapt/rxjs';
import { adapt } from './adapt.function';
import { StateAdaptToken } from './state-adapt-token.const';

/**
  @deprecated Use a service instead. This was an experimental pattern and will be removed in the future.
  Also see ngxtensions: https://github.com/nartc/ngxtension-platform/blob/main/libs/ngxtension/create-injection-token/src/create-injection-token.ts

  Wraps {@link adapt} and creates an injectable
  Can be called outside of a service or component

  ### Example: Basic adaptInjectable

  ```typescript
  export const injectNameStore = adaptInjectable('John');

  // ...
  export class AppComponent {
    name$ = injectNameStore().state$;
  }
  ```

  ### Example: adaptInjectable using dependency injection

  ```typescript
  export const injectNameStore = adaptInjectable('John', {
    sources: () => {
      // Can inject dependencies here
      const name$ = inject(HttpClient).get<Name>('api/name');
      return name$.pipe(toSource('name$'));
    },
  });

  // ...
  export class AppComponent {
    name$ = injectNameStore().state$;
  }
  ```
  */
export function adaptInjectable<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
>(
  initialState: State,
  second: (R & { selectors?: S } & NotAdaptOptions) | AdaptOptions<State, S, R> = {}, // Default object required to make R = {} rather than indexed object
): () => InitializedSmartStore<State, S, R> {
  const path = second?.path || 'adaptInjectable' + getId();
  const token = new InjectionToken(path, {
    providedIn: 'root',
    factory: function adaptInjectableFactory() {
      const adaptDep = inject(StateAdaptToken);
      const store = (adaptDep.adapt as any)(initialState, second);
      return store;
    },
  });
  return () => inject(token);
}
