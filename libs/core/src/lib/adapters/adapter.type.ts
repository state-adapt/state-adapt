// import { Reactions } from './reactions.interface';
import { SelectorsCache } from '../selectors/memoize-selectors.function';
import { Selectors } from '../selectors/selectors.interface';

export interface ReactionsWithSelectors<State, S extends Selectors<State>> {
  [index: string]:
    | ((
        state: State,
        event: any,
        initialState: State,
        selectorsCache: SelectorsCache,
      ) => State)
    | S;
}

export type WithSelectors<S> = { selectors?: S };

/**
  `Adapter` is a type of object containing 2 kinds of reusable state management patterns: State changes and selectors.

  State change functions are pure functions that implement ways state can change. They take 3 arguments and return a new state:

  ```typescript
  (
    state, // Current state
    payload, // Data needed to calculate new state
    initialState, // State the adapter was initialized with
  ) => ({ ...state }), // New state
  ```

  Selectors are pure functions that calculate derived state or just return a specific piece of state. They take one argument (`State`) and return any type:

  ```typescript
  state => state.property,
  ```

  #### Example: Basic adapter

  ```typescript
  import { Adapter } from '@state-adapt/core';
  type State = number;

  const adapter = {
    set: (state: State, payload: State) => payload,
    reset: (state: State, payload: any, initialState: State) => initialState,
    selectors: {
      state: (state: State) => state,
    },
  } satisfies Adapter<State, any, any>;
  ```
*/

export type Adapter<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
> = R & WithSelectors<S>;
