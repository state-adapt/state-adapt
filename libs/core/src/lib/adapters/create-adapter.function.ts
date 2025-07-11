import { memoizeSelectors } from '../selectors/memoize-selectors.function';
import { Selectors } from '../selectors/selectors.interface';
import { WithGetState } from '../selectors/with-get-state.type';
import { Adapter, ReactionsWithSelectors } from './adapter.type';

export type BasicAdapterMethods<State> = {
  set: (s: State, p: State) => State;
  reset: (s: State, p: void, i: State) => State;
};

export type AdapterState<A extends Adapter<any, any, any>> =
  A extends BasicAdapterMethods<infer S> ? S : never;

/**
  `createAdapter` is a function that takes an {@link Adapter} object and returns a new {@link Adapter} object with the following state change functions added:
  - `set`: A reaction that sets the state to the payload
  - `reset`: A reaction that sets the state to the initial state

  Every adapter also comes with a default selector:

  - `state` returns the top-level state value

  #### Example: Empty initial adapter object

  ```typescript
  import { createAdapter } from '@state-adapt/core';

  const numberAdapter = createAdapter<number>()({});
  ```

  #### Example: Small initial adapter object

  ```typescript
  import { createAdapter } from '@state-adapt/core';

  const numberAdapter = createAdapter<number>()({
    add: (state, n: number) => state + n,
    subtract: (state, n: number) => state - n,
    selectors: {
      negative: state => state * -1,
    },
  });
  ```

  #### Example: Initial adapter object with complex state

  ```typescript
  import { createAdapter } from '@state-adapt/core';

  interface ComplexState {
    count: number;
    name: string;
  }

  const complexAdapter = createAdapter<ComplexState>()({
    increment: state => ({ ...state, count: state.count + 1 }),
    decrement: state => ({ ...state, count: state.count - 1 }),
    setName: (state, name: string) => ({ ...state, name }),
    selectors: {
      negative: state => state.count * -1,
    },
  });
  ```

*/
export function createAdapter<State>() {
  return <S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    adapter: Adapter<State, S, R>,
  ): InitializedAdapter<State, S, R> => ({
    set: (state, payload) => payload,
    // Add update reaction back if we ever pass in a default state
    reset: (state, payload, initialState) => initialState,
    ...adapter, // New reactions object
    selectors: memoizeSelectors<State, S>((adapter.selectors as S) || ({} as S)), // New selectors object
  });
}

type InitializedAdapter<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
> = ({} extends S
  ? R & { selectors: WithGetState<State> }
  : R & { selectors: S & WithGetState<State> }) &
  BasicAdapterMethods<State>;
