import { computed, DestroyRef, inject, Signal, signal } from '@angular/core';
import { SmartStore, StateAdapt } from '@state-adapt/rxjs';
import {
  Adapter,
  BasicAdapterMethods,
  ReactionsWithSelectors,
  Selectors,
  WithGetState,
} from '@state-adapt/core';
import { StateAdaptToken } from './state-adapt-token.const';

export type WatchStoreSignals<State, S extends Selectors<State>> = Signal<
  State | undefined
> & {
  [K in keyof S]: Signal<ReturnType<S[K]> | undefined>;
};

// Differences between StateAdapt.watch and watch jsdoc:
//  - The phrase "`watch` wraps {@link StateAdapt.watch}, calling `inject(StateAdapt)` to get the instance of {@link StateAdapt} to use."
//  - Examples have been modified to show usage in classes
/**
  `watch` wraps {@link StateAdapt.watch} for Angular and adds signals for the store's selectors.

  `watch` returns a detached store (doesn't chain off of sources). This allows you to watch state without affecting anything.
  Its signals are `undefined` until the watched path becomes active, then mirror its latest state without activating its sources.
  It takes the path of the state you are interested in and, optionally, the adapter containing the selectors you want to use.

  ```tsx
  watch(path, adapter)
  ```

  path — Object path in Redux Devtools

  adapter — Optional object with state change functions and selectors. When omitted, `watch` uses the base adapter.

  ### Usage

  `watch` enables accessing state without subscribing to sources. For example, if your adapter manages the loading state
  for an HTTP request and you need to know if the request is loading before the user is interested in the data,
  `watch` can give you access to it without triggering the request.

  #### Example: Accessing loading state

  ```tsx
  watch('data', httpAdapter).loading$.subscribe(console.log);
  ```
  */
export function watch<
  State = any,
  // eslint-disable-next-line @typescript-eslint/ban-types -- Intentional empty generic default.
  S extends Selectors<State> = {},
  // eslint-disable-next-line @typescript-eslint/ban-types -- Intentional empty generic default.
  R extends ReactionsWithSelectors<State, S> = {},
>(
  path: string,
  adapter?: Adapter<State, S, R & BasicAdapterMethods<State>>,
): SmartStore<State, S & WithGetState<State>> & WatchStoreSignals<State, S> {
  const adaptDep = inject(StateAdaptToken);
  const destroyRef = inject(DestroyRef);
  const storeObj = (adaptDep.watch as any)(path, adapter);
  const unset = Symbol('unset watch value');
  const state = signal<any>(unset);
  const subscription = storeObj.state$.subscribe((value: any) => state.set(value));
  destroyRef.onDestroy(() => subscription.unsubscribe());

  const store: any = function () {
    const value = state();
    return value === unset ? undefined : value;
  };
  Object.assign(store, storeObj);

  const selectors = storeObj.__.selectors;
  for (const prop in selectors) {
    const value = computed(() => {
      const currentState = state();
      return currentState === unset ? undefined : selectors[prop](currentState);
    });
    if (fnOverrideProps.includes(prop)) {
      Object.defineProperty(store, prop, { value });
    } else {
      store[prop] = value;
    }
  }

  return store;
}

// toString doesn't care; regular assignment works fine
const fnOverrideProps = ['length', 'name'];
