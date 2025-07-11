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
import { useProxyStates } from './use-proxy-states';

// Differences between StateAdapt.adapt and useAdapt jsdoc:
//  - Almost everything
/**
  `useAdapt` is a hook that wraps {@link StateAdapt.adapt} and {@link useStore}. It creates a store, immediately subscribes to it,
  and returns a tuple `[selectorResults, setState]` where `selectorResults` is a proxy object containing results from the store's selectors,
  and `setState` is a function with additional properties assigned from the store created by {@link StateAdapt.adapt}.


  `useAdapt` is like an advanced version of [`useState`](https://beta.reactjs.org/reference/react/useState)
  or [`useReducer`](https://beta.reactjs.org/reference/react/useReducer). All of the values you pass into it
  are only used once, when the store is created. Any further updates to the store need to be done through
  the store itself (returned by `useAdapt` in the second position of the tuple) or indirectly through the sources
  passed into `useAdapt`.

  ### Example: initialState only
  `useAdapt(initialState)`

  `useAdapt` starts with very similar syntax to `useState`'s. The main difference is that `state` is accessed
  as a property of the first tuple element. Also, the `setState` function has a `reset` property function that resets the store's state.

  ```tsx
  export function MyComponent() {
    const [name, setName] = useAdapt('John');

    // Shows "John" first
    // Shows "Johnsh" when the "Set" button is clicked
    // Shows "John" again when the "Reset" button is clicked
    return (
      <>
        <div>{name.state}</div>
        <button onClick={() => setName('Johnsh')}>Set</button>
        <button onClick={() => setName.reset()}>Reset</button>
      </>
    );
  }
  ```

  ### Example: Using an adapter
  `useAdapt(initialState, adapter)`

  You can also pass in a state {@link Adapter} object to customize the state change functions and selectors.

  ```tsx
  export function MyComponent() {
    const [name, setName] = useAdapt('John', {
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
        <button onClick={() => setName.concat('sh')}>Concat</button>
        <button onClick={() => setName.reset()}>Reset</button>
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
  const onTick = interval(1000);

  export function MyComponent() {
    const [clock] = useAdapt(0, {
      adapter: {
        increment: state => state + 1,
      },
      sources: onTick, // or [onTick], or { set: onTick }, or { set: [onTick] }
      path: 'clock',
    });

    // Shows 0, 1, 2, 3, etc. every second
    return <div>{clock.state}</div>;
  }
  ```

  When a store is subscribed to, it passes the subscriptions up to its sources.
  For example, if a store has an HTTP source, it will be triggered when the store
  receives its first subscriber, and it will be canceled when the store loses its
  last subscriber. `useAdapt` immediately subscribes.

  There are 4 possible ways sources can be defined:

  1\. A source can be a single source or [Observable](https://rxjs.dev/guide/observable)<`State`>. When the source emits, it triggers the store's `set` method
  with the payload.

  #### Example: Single source or observable

  ```tsx
  const onNameChange = source<string>();

  export function MyComponent() {
    const [name] = useAdapt('John', {
      sources: onNameChange,
      path: 'name',
    });

    // Shows 'John' first
    // Shows 'Johnsh' when the "Set" button is clicked
    return (
      <>
        <div>{name.state}</div>
        <button onClick={() => onNameChange('Johnsh')}>Set</button>
      </>
    );
  }
  ```

  2\. A source can be an array of sources or [Observable](https://rxjs.dev/guide/observable)<`State`>. When any of the sources emit, it triggers the store's `set`
   method with the payload.

  #### Example: Array of sources or observables

  ```tsx
  const onNameChange = source<string>();
  const onNameChange2 = source<string>();

  export function MyComponent() {
    const [name] = useAdapt('John', {
      sources: [onNameChange, onNameChange2],
      path: 'name',
    });

    // Shows 'John' first
    // Shows 'Johnsh' when the "Set" button is clicked
    // Shows 'Johnsh2' when the "Set2" button is clicked
    return (
      <>
        <div>{name.state}</div>
        <button onClick={() => onNameChange('Johnsh')}>Set</button>
        <button onClick={() => onNameChange2('Johnsh2')}>Set2</button>
      </>
    );
  }
  ```

  3\. A source can be an object with keys that match the names of the {@link Adapter} state change functions, with a corresponding source or array of
  sources that trigger the store's reaction with the payload.

  #### Example: Object of sources or observables

  ```tsx
  const onNameChange = source<string>();
  const onNameReset = source<void>();

  export function MyComponent() {
    const [name] = useAdapt('John', {
      sources: {
        set: onNameChange,
        reset: [onNameReset], // Can be array of sources too
      },
      path: 'name',
    });

    // Shows 'John' first
    // Shows 'Johnsh' when the "Set" button is clicked
    // Shows 'John' again when the "Reset" button is clicked
    return (
      <>
        <div>{name.state}</div>
        <button onClick={() => onNameChange('Johnsh')}>Set</button>
        <button onClick={onNameReset}>Reset</button>
      </>
    );
  }
  ```

  4\. A source can be a function that takes in a detached store (doesn't chain off of sources) and returns any of the above
  types of sources or observables.

  #### Example: Function that returns an observable

  ```tsx
  export function MyComponent() {
    const [name] = useAdapt('John', {
      sources: store => store.state$.pipe(
        delay(1000),
        map(name => `${name}sh`),
        toSource('recursive onNameChange'),
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

  ### No path

  If no path is provided, then the store's path defaults to the result of calling {@link getId}.

  ### Remember!

  The store needs to have subscribers in order to start managing state,
  and it only subscribes to sources when it has subscribers itself.
  */
export function useAdapt<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
>(
  initialState: State,
  second: (R & { selectors?: S } & NotAdaptOptions) | AdaptOptions<State, S, R> = {}, // Default object required to make R = {} rather than indexed object
): ProxyStoreTuple<State, InitializedSmartStore<State, S, R>> {
  const stateAdapt = useContext(AdaptContext);
  const [store] = useState(() => stateAdapt.adapt(initialState, second));
  function setState(newState: State) {
    store.set(newState);
  }
  Object.assign(setState, store);
  const proxy = useProxyStates(store) as any;
  return [proxy, setState as any];
}
