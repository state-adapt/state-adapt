import { useContext, useState } from 'react';
import { AdaptContext } from './adapt.context';
import { useStore } from './use-store';
import {
  Sources,
  Source,
  StateAdapt,
  InitializedSmartStore,
  SourceArg,
  AdaptOptions,
  NotAdaptOptions,
} from '@state-adapt/rxjs';
import {
  Action,
  ReactionsWithSelectors,
  Selectors,
  createAdapter,
  getId,
} from '@state-adapt/core';
import { ProxyStoreTuple } from './proxy-store-tuple.type';

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

  ### Example: initialState only
  `useAdapt(initialState)`

  The simplest way to use `useAdapt` is to only pass it an initial state. `useAdapt` returns a store object that is ready to start managing state once it has subscribers.
  The store object comes with `set` and `reset` methods for updating state, and a `state$` observable of the store's state.

  ```tsx
  export function MyComponent() {
    const [name, nameStore] = useAdapt('John');

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
  }
  ```

  ### Example: Using an adapter
  `useAdapt(initialState, adapter)`

  You can also pass in a state {@link Adapter} object to customize the state change functions and selectors.

  ```tsx
  export function MyComponent() {
    const [name, nameStore] = useAdapt('John', {
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
  }
  ```

  ### Example: Using {@link AdaptOptions}
  `useAdapt(initialState, { adapter, sources, path })`

  You can also define an adapter, sources, and/or a state path as part of an {@link AdaptOptions} object.

  Sources allow the store to declaratively react to external events rather than being commanded
  by imperative callback functions.

  ```tsx
  const tick$ = interval(1000).pipe(toSource('tick$'));

  export function MyComponent() {
    const [clock] = adapt(0, {
      adapter: {
        increment: state => state + 1,
      },
      sources: tick$, // or [tick$], or { set: tick$ }, or { set: [tick$] }
      path: 'clock',
    });

    // Shows 0, 1, 2, 3, etc. every second
    return <div>{clock.state}</div>;
  }
  ```

  There are 4 possible ways sources can be defined:

  1\. A source can be a single {@link Source} or [Observable](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>>. When the source emits, it triggers the store's `set` method
  with the payload.

  #### Example: Single source

  ```tsx
  const nameChange$ = new Source<string>('nameChange$');

  export function MyComponent() {
    const [name] = useAdapt('John', {
      sources: nameChange$,
      path: 'name',
    });

    // Shows 'John' first
    // Shows 'Johnsh' when the "Set" button is clicked
    return (
      <>
        <div>{name.state}</div>
        <button onClick={() => nameChange$.next('Johnsh')}>Set</button>
      </>
    );
  }
  ```

  2\. A source can be an array of {@link Source} or [Observable](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>>. When any of the sources emit, it triggers the store's `set`
   method with the payload.

  #### Example: Array of sources

  ```tsx
  const nameChange$ = new Source<string>('nameChange$');
  const nameChange2$ = new Source<string>('nameChange2$');

  export function MyComponent() {
    const [name] = useAdapt('John', {
      sources: [nameChange$, nameChange2$],
      path: 'name',
    });

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
  }
  ```

  3\. A source can be an object with keys that match the names of the {@link Adapter} state change functions, with a corresponding source or array of
  sources that trigger the store's reaction with the payload.

  #### Example: Object of sources

  ```tsx
  const nameChange$ = new Source<string>('nameChange$');
  const nameReset$ = new Source<void>('nameReset$');

  export function MyComponent() {
    const [name] = useAdapt('John', {
      sources: {
        set: nameChange$,
        reset: [nameReset$], // Can be array of sources too
      },
      path: 'name',
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
  }
  ```

  4\. A source can be a function that takes in a detached store (result of calling {@link StateAdapt.watch}) and returns any of the above
  types of sources.

  #### Example: Function that returns a source

  ```tsx
  export function MyComponent() {
    const [name] = useAdapt('John', {
      sources: store => store.state$.pipe(
        delay(1000),
        map(name => `${name}sh`),
        toSource('recursive nameChange$'),
      ),
    });

    // Shows 'John' first
    // Shows 'Johnsh' after 1 second, then 'Johnshsh' after 1 more second, etc.
    return <div>{name.state}</div>;
  }
  ```

  Defining a path alongside sources is recommended to enable debugging with Redux DevTools. It's easy to trace
  singular state changes caused by user events, but it's much harder to trace state changes caused by RxJS streams.

  The path string specifies the location in the global store you will find the state for the store being created
  (while the store has subscribers). StateAdapt splits this string at periods `'.'` to create an object path within
  the global store. Here are some example paths and the resulting global state objects:

  #### Example: Paths and global state

  ```tsx
  const [states, store] = useAdapt(0, { path: 'number' });
  // global state: { number: 0 }
  ```

  ```typescript
  const [states, store] = useAdapt(0, { path: 'featureA.number' });
  // global state: { featureA: { number: 0 } }
  ```

  ```typescript
  const [states, store] = useAdapt(0, { path: 'featureA.featureB.number' });
  // global state: { featureA: { featureB: { number: 0 } } }
  ```

  Each store completely owns its own state. If more than one store tries to use the same path, StateAdapt will throw this error:

  `Path '${path}' collides with '${existingPath}', which has already been initialized as a state path.`

  This applies both to paths that are identical as well as paths that are subtrings of each other. For example, if `'featureA'`
  is already being used by a store and then another store tried to initialize at `'featureA.number'`, that error would be thrown.

  To help avoid this error, StateAdapt provides a {@link getId} function that can be used to generate unique paths:

  #### Example: getId for unique paths

  ```tsx
  import { getId } from '@state-adapt/core';

  const path0 = 'number' + getId();
  const path1 = 'number' + getId();

  export function MyComponent() {
    const [states1, store1] = useAdapt(0, { path: path0 });
    const [states2, store2] = useAdapt(0, { path: path1 });
    // global state: { number0: 0, number1: 0 }
    return <div>{states1.state} {states2.state}</div>;
  }
  ```

  ### Remember!

  The store needs to have subscribers in order to start managing state.
  */
export function useAdapt<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
>(
  initialState: State,
  second: (R & { selectors?: S } & NotAdaptOptions) | AdaptOptions<State, S, R> = {}, // Default object required to make R = {} rather than indexed object
): ProxyStoreTuple<{} & InitializedSmartStore<State, S, R>> {
  const stateAdapt = useContext(AdaptContext);
  const [store] = useState(() => stateAdapt.adapt(initialState, second));
  const proxy = useStore(store);
  return [proxy, store];
}
