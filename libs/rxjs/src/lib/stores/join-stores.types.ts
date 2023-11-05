import {
  SelectorReturnTypes,
  Selectors,
  SelectorsCache,
  SelectorsWithNewBlock,
} from '@state-adapt/core';

import { JoinedStore } from './joined-store.interface';
import { StoreLike } from './store-like.type';

export type StoreEntries = {
  [index: string]: StoreLike<any, any, any>;
};

type StoreState<Store extends StoreLike<any, any, any>> = Store extends StoreLike<
  infer State,
  any,
  any
>
  ? State
  : never;

export type EntriesState<SE extends StoreEntries> = {
  [K in string & keyof SE]: StoreState<SE[K]>;
};

type PrefixedSelectors<
  State,
  Prefix extends string & keyof State,
  S extends Selectors<any>,
> = {
  [K in string & keyof S as K extends 'state' ? never : `${Prefix}${Capitalize<K>}`]: (
    state: State,
  ) => ReturnType<S[K]>;
};

type SelectorsOfState<State> = {
  [K in string & keyof State]: (state: State) => State[K];
};

export type JoinedSelectors<SE extends StoreEntries> = SelectorsOfState<
  EntriesState<SE>
> &
  ({
    [K in string & keyof SE]: (
      x: PrefixedSelectors<EntriesState<SE>, K, SE[K]['__']['fullSelectors']>,
    ) => void;
  }[string & keyof SE] extends (x: infer I) => void
    ? I
    : never);

export type StoreBuilder<State, S extends Selectors<State>, SE extends StoreEntries> = {
  storeEntries: SE;
  namespaces: (string & keyof SE)[];
  selectors: S;
  fullSelectors: S;
  initialState: State;
  getCacheOverride: (c: SelectorsCache) => SelectorsCache;
  // getFullCacheOverride: (c: SelectorsCache) => SelectorsCache;
};

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export type AddNewBlock<
  State,
  S extends Selectors<State>,
  SE extends StoreEntries,
  D extends Prev[number] = 19,
> = (
  builder: StoreBuilder<State, S, SE>,
) => D extends [never] ? S : NewBlockAdder<State, S, SE, D>;

export interface NewBlockAdder<
  State,
  S extends Selectors<State>,
  SE extends StoreEntries,
  D extends Prev[number] = 19,
> {
  (): JoinedStore<State, S>;

  <NewBlock extends Selectors<SelectorReturnTypes<State, S>>>(
    newBlock: NewBlock,
  ): {} & ReturnType<
    AddNewBlock<
      State,
      {
        [K in string &
          keyof SelectorsWithNewBlock<State, S, NewBlock>]: SelectorsWithNewBlock<
          State,
          S,
          NewBlock
        >[K];
      },
      SE,
      Prev[D]
    >
  >;
}
