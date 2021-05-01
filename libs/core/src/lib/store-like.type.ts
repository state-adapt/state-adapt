import { AnySelectors } from './any-selectors.interface';
import { JoinedMiniStore } from './joined-mini-store.interface';
import { MiniStore } from './mini-store.interface';
import { Selectors } from './selectors.interface';

export type StoreLike<
  State,
  S extends Selectors<State>,
  AS extends AnySelectors
> = MiniStore<State, S> | JoinedMiniStore<State, AS>;
