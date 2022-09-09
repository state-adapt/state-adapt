import { AnySelectors, Selectors } from '@state-adapt/core';
import { JoinedMiniStore } from './joined-mini-store.interface';
import { MiniStore } from './mini-store.interface';

export type StoreLike<State, S extends Selectors<State>, AS extends AnySelectors> =
  | MiniStore<State, S>
  | JoinedMiniStore<State, AS>;
