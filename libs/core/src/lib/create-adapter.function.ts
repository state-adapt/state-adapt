import { Adapter, ReactionsWithSelectors } from './adapter.type';
import { Selectors } from './selectors.interface';

export type BasicAdapterMethods<State> = {
  noop: (s: State) => State;
  set: (s: State, p: State) => State;
  update: (s: State, u: Partial<State>) => State;
  reset: (s: State, p: any, i: State) => State;
};

export function createAdapter<State>() {
  return <S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    adapter: Adapter<State, S, R> = {} as Adapter<State, S, R>,
  ): Adapter<State, S, R & BasicAdapterMethods<State>> => ({
    noop: state => state,
    set: (state, payload) => payload,
    update: (state, update) => ({ ...state, ...update }),
    reset: (state, payload, initialState) => initialState,
    ...adapter,
    selectors: {
      ...(adapter.selectors || ({} as S)),
      state: state => state,
    },
  });
}
