import { AnySelectors, Selectors } from '@state-adapt/core';
import { JoinedStore } from './joined-store.interface';
import { SmartStore } from './smart-store.interface';

export type StoreLike<
  State,
  S extends Selectors<State> = any,
  AS extends AnySelectors = any,
> = SmartStore<State, S> | JoinedStore<State, AS>;
