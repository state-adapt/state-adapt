import { memoizeSelectors } from '../selectors/memoize-selectors.function';
import { Selectors } from '../selectors/selectors.interface';
import { Adapter, ReactionsWithSelectors } from './adapter.type';

export type BasicAdapterMethods<State> = {
  set: (s: State, p: State) => State;
  reset: (s: State, p: void, i: State) => State;
};

export function createAdapter<State>() {
  return <S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    adapter: Adapter<State, S, R> = {} as Adapter<State, S, R>,
  ): Adapter<State, S, R & BasicAdapterMethods<State>> => ({
    set: (state, payload) => payload,
    // Add update reaction back if we ever pass in a default state
    reset: (state, payload, initialState) => initialState,
    ...adapter, // New reactions object
    selectors: memoizeSelectors<State, S>((adapter.selectors as S) || ({} as S)), // New selectors object
  });
}
