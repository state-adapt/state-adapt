import { SelectorsCache } from '../selectors/memoize-selectors.function';

export type Reaction<State> = (
  state: State,
  event: any,
  initialState: State,
  selectorsCache: SelectorsCache,
) => State;
