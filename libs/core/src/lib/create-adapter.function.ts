import { Adapter, ReactionsWithGetSelectors } from './adapter.type';
import { Selectors } from './selectors.interface';

export function createAdapter<State>() {
  return <
    S extends Selectors<State>,
    R extends ReactionsWithGetSelectors<State, S>
  >(
    adapter: Adapter<State, S, R>
  ) => ({
    ...adapter,
  });
}
