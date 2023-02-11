import { SelectorsCache } from '../selectors/memoize-selectors.function';
/**
 * A reaction is a pure function that takes the current state, an event payload, the initial state and a selectors cache
 * and returns the new state.
 * @param state The state type
 * @param payload The event payload
 * @param initialState The initial state used to create a store
 * @param selectorsCache The selectors cache tied to a store. Usually created internally by StateAdapt
 */
export type Reaction<State> = (
  state: State,
  payload: any,
  initialState: State,
  selectorsCache: SelectorsCache,
) => State;
