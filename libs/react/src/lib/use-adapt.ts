import { useContext, useState } from 'react';
import { AdaptContext } from './adapt.context';
import { useStore } from './use-store';
import {
  InitializedReactions,
  SmartStore,
  Sources,
  Source,
  StateAdapt,
} from '@state-adapt/rxjs';
import {
  Action,
  ReactionsWithSelectors,
  Selectors,
  SyntheticSources,
  WithGetState,
  createAdapter,
} from '@state-adapt/core';
import { ProxyStoreTuple } from './proxy-store-tuple.type';
import { Observable } from 'rxjs';

// Differences between StateAdapt.adapt and useAdapt jsdoc:
//  - Almost everything
/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `useAdapt`

  > Copilot tip: Copy examples into your file or click to definition to open file with context for better Copilot suggestions.

  `useAdapt` is a hook that wraps {@link StateAdapt.adapt} and {@link useStore}.
  It creates a store, immediately subscribes to it, and returns a `[proxy, store]` tuple, where
  `proxy` is the return value of {@link useStore} and `store` is the return value of {@link StateAdapt.adapt}.

  `useAdapt` is like an advanced version of [`useState`](https://beta.reactjs.org/reference/react/useState)
  or [`useReducer`](https://beta.reactjs.org/reference/react/useReducer). All of the values you pass into it
  are only used once, when the store is created. Any further updates to the store need to be done through
  the store itself (returned by `useAdapt` in the second position of the tuple) or indirectly through the sources
  passed into `useAdapt`.

  ### Overloads
  ```javascript
  useAdapt(path, initialState)
  useAdapt([path, initialState], adapter)
  useAdapt([path, initialState], sources)
  useAdapt([path, initialState, adapter], sources)
  ```

  path: `string` — Object path in Redux Devtools

  initialState: {@link State} — Initial state of the store when it gets initialized with a subscription to its state

  adapter: {@link Adapter} — Object with state change functions and selectors

  sources:
  - [Observable](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>> — Single source for `set` state change
  - [Observable](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>>[] — Array of sources for `set` state change
  - {@link Sources} — Object specifying sources for state change functions

  ### Overload 1
  `useAdapt(path, initialState)`

  The path string specifies the location in the global store you will find the state for the store being created.
  StateAdapt splits this string at periods `'.'` to create an object path within
  the global store. Here are some example paths and the resulting global state objects:

  #### Example: Paths and global state

  ```typescript
  const [states, store] = useAdapt('number', 0);
  // global state: { number: 0 }

  const [states, store] = useAdapt('featureA.number', 0);
  // global state: { featureA: { number: 0 } }

  const [states, store] = useAdapt('featureA.featureB.number', 0);
  // global state: { featureA: { featureB: { number: 0 } } }
  ```

  Each store completely owns its own state. If more than one store tries to use the same path, StateAdapt will throw this error:

  `Path '${path}' collides with '${existingPath}', which has already been initialized as a state path.`

  This applies both to paths that are identical as well as paths that are subtrings of each other. For example, if `'featureA'`
  is already being used by a store and then another store tried to initialize at `'featureA.number'`, that error would be thrown.

  To help avoid this error, StateAdapt provides a {@link getId} function that can be used to generate unique paths:

  #### Example: getId for unique paths

  ```typescript
  import { getId } from '@state-adapt/core';

  const path0 = 'number' + getId();
  const path1 = 'number' + getId();

  export const MyComponent = () => {
    const [states1, store1] = useAdapt(path0, 0);
    const [states2, store2] = useAdapt(path1, 0);
    // global state: { number0: 0, number1: 0 }
    return <div>{states1.state} {states2.state}</div>;
  };
  ```

  The store object returned in the 2nd place in the tuple comes with `set`
  and `reset` methods for updating the state, and a `state$` RxJS
  [`Observable`](https://rxjs.dev/guide/observable) of the store's state.
  But with `useAdapt` you will usually access the store's state through the
  proxy object returned in the 1st place in the tuple.

  #### Example: `set`, `reset` and `state$`

  ```tsx
  export const MyComponent = () => {
    const [name, nameStore] = useAdapt('name', 'John');

    // Shows "John" first
    // Shows "Johnsh" when the "Set" button is clicked
    // Shows "John" again when the "Reset" button is clicked
    return (
      <>
        <div>{name.state}</div>
        <button onClick={() => nameStore.set('Johnsh')}>Set</button>
        <button onClick={() => nameStore.reset()}>Reset</button>
      </>
    );
  };
  ```

  ### Overload 2
  `useAdapt([path, initialState], adapter)`

  The adapter is an object such as one created by {@link createAdapter}. It contains methods for updating state,
  called "state changes" or "reactions", and optionally selectors for reading the state. Every reaction function becomes a method on
  the store object, and every selector becomes both an observable on the store object, and a "property" on the proxy object.

  #### Example: Inlined adapter

  ```tsx
  export const MyComponent = () => {
    const [name, nameStore] = useAdapt(['name', 'John'], {
      concat: (state, payload: string) => state + payload,
      selectors: {
        length: state => state.length,
      },
    });

    // Shows 'John' and 4 first
    // Shows 'Johnsh' and 6 when the "Concat" button is clicked
    // Shows 'John' and 4 again when the "Reset" button is clicked
    return (
      <>
        <div>{name.state}</div>
        <div>{name.length}</div>
        <button onClick={() => nameStore.concat('sh')}>Concat</button>
        <button onClick={() => nameStore.reset()}>Reset</button>
      </>
    );
  };
  ```

  ### Overload 3
  `useAdapt([path, initialState], sources)`

  Sources allow the store to react to external events. There are 3 possible ways sources can be defined:

  ##### 1. A source can be a single {@link Source} or [`Observable`](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>>. When the source emits, it triggers the store's `set` method with the payload.

  #### Example: Single source

  ```tsx
  const nameChange$ = new Source<string>('nameChange$');

  export const MyComponent = () => {
    const [name] = useAdapt(['name', 'John'], nameChange$);

    // Shows 'John' first
    // Shows 'Johnsh' when the "Set" button is clicked
    return (
      <>
        <div>{name.state}</div>
        <button onClick={() => nameChange$.next('Johnsh')}>Set</button>
      </>
    );
  };
  ```

  ##### 2. A source can be an array of {@link Source} or [`Observable`](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>>. When any of the sources emit, it triggers the store's `set` method with the payload.

  #### Example: Array of sources

  ```tsx
  const nameChange$ = new Source<string>('nameChange$');
  const nameChange2$ = new Source<string>('nameChange2$');

  const MyComponent = () => {
    const [name] = useAdapt(['name', 'John'], [nameChange$, nameChange2$]);

    // Shows 'John' first
    // Shows 'Johnsh' when the "Set" button is clicked
    // Shows 'Johnsh2' when the "Set2" button is clicked
    return (
      <>
        <div>{name.state}</div>
        <button onClick={() => nameChange$.next('Johnsh')}>Set</button>
        <button onClick={() => nameChange2$.next('Johnsh2')}>Set2</button>
      </>
    );
  };
  ```

  ##### 3. A source can be an object with keys that match the names of the store's reactions, with a corresponding source or array of sources that trigger the store's reaction with the payload.

  #### Example: Object of sources

  ```tsx
  const nameChange$ = new Source<string>('nameChange$');
  const nameReset$ = new Source<void>('nameReset$');

  const MyComponent = () => {
    const [name] = useAdapt(['name', 'John'], {
      set: nameChange$,
      reset: [nameReset$], // Can be array of sources too
    });

    // Shows 'John' first
    // Shows 'Johnsh' when the "Set" button is clicked
    // Shows 'John' again when the "Reset" button is clicked
    return (
      <>
        <div>{name.state}</div>
        <button onClick={() => nameChange$.next('Johnsh')}>Set</button>
        <button onClick={() => nameReset$.next()}>Reset</button>
      </>
    );
  };
  ```

  Each selector's observable chains off of all the sources passed into the store. For example, if one of your sources
  is an observable of an HTTP request, that request will triggered as soon as you call `useAdapt` or
  subscribe to any of the selector observables from the store. If necessary, you can access store selectors that do not
  chain off of any sources by using {@link StateAdapt.watch}.

  ### Overload 4
  `useAdapt([path, initialState, adapter], sources)`

  The adapter and sources can be combined in the same overload.

  #### Example: Adapter and sources

  ```tsx
  const nameChange$ = new Source<string>('nameChange$');
  const nameConcat$ = new Source<string>('nameConcat$');

  const nameAdapter = createAdapter<string>()({
    concat: (state, payload: string) => state + payload,
  });

  const MyComponent = () => {
    const [name] = useAdapt(['name', 'John', nameAdapter], {
      set: nameChange$,
      concat: nameConcat$,
    });

    // Shows 'John' first
    // Shows 'Johnsh' when the "Set" button is clicked
    // Shows 'Johnshsh' when the "Concat" button is clicked // Example suggested by Copilot :)
    return (
      <>
        <div>{name.state}</div>
        <button onClick={() => nameChange$.next('Johnsh')}>Set</button>
        <button onClick={() => nameConcat$.next('sh')}>Concat</button>
      </>
    );
  };
  ```
  */
// useAdapt(path, initialState)
export function useAdapt<State>(
  path: string,
  initialState: State,
): ProxyStoreTuple<
  SmartStore<State, WithGetState<State>> & SyntheticSources<InitializedReactions<State>>
>;

// useAdapt([path, initialState], adapter)
export function useAdapt<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
>(
  [path, initialState]: [string, State],
  adapter: R & { selectors?: S },
): ProxyStoreTuple<
  SmartStore<State, S & WithGetState<State>> &
    SyntheticSources<InitializedReactions<State, S, R>>
>;

// useAdapt([path, initialState], sources);
export function useAdapt<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
>(
  [path, initialState]: [string, State],
  sources:
    | Sources<State, S, InitializedReactions<State, S, R>>
    | Observable<Action<State>>
    | Observable<Action<State>>[],
): ProxyStoreTuple<
  SmartStore<State, S & WithGetState<State>> &
    SyntheticSources<InitializedReactions<State, S, R>>
>;

// useAdapt([path, initialState, adapter], sources);
export function useAdapt<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
>(
  [path, initialState, adapter]: [string, State, R & { selectors?: S }],
  sources:
    | Sources<State, S, InitializedReactions<State, S, R>>
    | Observable<Action<State>>
    | Observable<Action<State>>[],
): ProxyStoreTuple<
  SmartStore<State, S & WithGetState<State>> &
    SyntheticSources<InitializedReactions<State, S, R>>
>;
export function useAdapt<T extends any[]>(...args: T) {
  const stateAdapt = useContext(AdaptContext);
  const [store] = useState(() => (stateAdapt.adapt as any)(...args));
  const proxy = useStore(store);
  return [proxy, store];
}
