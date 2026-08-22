import {
  AdaptOptions,
  InitialState,
  InitializedSmartStore,
  NotAdaptOptions,
  SmartStore,
} from '@state-adapt/rxjs';
import {
  Adapter,
  BasicAdapterMethods,
  ReactionsWithSelectors,
  Selectors,
  WithGetState,
} from '@state-adapt/core';
import { createStoreSelectorReader } from './derived';

const REACT_STORE = Symbol('React StateAdapt store');

/**
 * Functions that read a store's state and each of its selector results.
 *
 * @hidden
 */
export type StoreSelectorReaders<State, S extends Selectors<State>> = (() => State) & {
  [K in keyof S]: () => ReturnType<S[K]>;
};

/**
 * The store returned by {@link adapt}. Call the store for its current state, or
 * a selector property for its current result.
 *
 * @hidden
 */
export type ReactStore<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
> = InitializedSmartStore<State, S, R> &
  StoreSelectorReaders<State, S & WithGetState<State>>;

/**
 * The store returned by {@link watch}. Call the store for its current state, or
 * a selector property for its current result. Reads are `undefined` while the
 * store is inactive.
 *
 * @hidden
 */
export type ReactWatch<State, S extends Selectors<State>> = SmartStore<
  State,
  S & WithGetState<State>
> &
  (() => State | undefined) & {
    [K in keyof (S & WithGetState<State>)]: () =>
      | ReturnType<(S & WithGetState<State>)[K]>
      | undefined;
  };

export function createReactStore<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
>(storeObj: InitializedSmartStore<State, S, R>): ReactStore<State, S, R> {
  if ((storeObj as any)[REACT_STORE]) return storeObj as any;

  const state = createStoreSelectorReader(storeObj, storeObj.__.fullSelectors.state);
  const store = Object.assign(state, storeObj) as any;
  Object.defineProperty(store, REACT_STORE, { value: true });

  for (const prop in storeObj.__.fullSelectors) {
    const reader = createStoreSelectorReader(
      storeObj,
      (storeObj.__.fullSelectors as any)[prop],
    );
    if (prop === 'length' || prop === 'name') {
      Object.defineProperty(store, prop, { value: reader });
    } else {
      store[prop] = reader;
    }
  }

  return store;
}

export function createReactWatchStore<State, S extends Selectors<State>>(
  storeObj: SmartStore<State, S & WithGetState<State>>,
): ReactWatch<State, S> {
  const isUnavailable = () => !storeObj.__.isActive();
  const state = createStoreSelectorReader(
    storeObj,
    storeObj.__.fullSelectors.state,
    isUnavailable,
  );
  const store = Object.assign(state, storeObj) as any;
  Object.defineProperty(store, REACT_STORE, { value: true });

  for (const prop in storeObj.__.fullSelectors) {
    const reader = createStoreSelectorReader(
      storeObj,
      (storeObj.__.fullSelectors as any)[prop],
      isUnavailable,
    );
    if (prop === 'length' || prop === 'name') {
      Object.defineProperty(store, prop, { value: reader });
    } else {
      store[prop] = reader;
    }
  }

  return store;
}

export const createReactAdapt = (
  adapt: (...args: any[]) => any,
): {
  /** Creates a store using this StateAdapt instance. */
  <
    State,
    S extends Selectors<State>,
    R extends ReactionsWithSelectors<State, S>,
    R2 extends ReactionsWithSelectors<State, S>,
    ReturnedSources = unknown,
  >(
    initialState: InitialState<State>,
    second?:
      | (R & { selectors?: S } & NotAdaptOptions)
      | AdaptOptions<State, S, R2, ReturnedSources>,
    // eslint-disable-next-line @typescript-eslint/ban-types -- Literal `{}` preserves deferred generic inference.
  ): ReactStore<State, S, {} extends R ? R2 : R>;
} =>
  ((initialState: any, second: any = {}) =>
    createReactStore(adapt(initialState, second))) as any;

export const createReactWatch = (
  watch: (...args: any[]) => any,
): {
  /** Watches a store path using this StateAdapt instance. */
  <
    State = any,
    // eslint-disable-next-line @typescript-eslint/ban-types -- Intentional empty generic default.
    S extends Selectors<State> = {},
    // eslint-disable-next-line @typescript-eslint/ban-types -- Intentional empty generic default.
    R extends ReactionsWithSelectors<State, S> = {},
  >(
    path: string,
    adapter?: Adapter<State, S, R & BasicAdapterMethods<State>>,
  ): ReactWatch<State, S>;
} =>
  ((path: string, adapter?: any) => createReactWatchStore(watch(path, adapter))) as any;
