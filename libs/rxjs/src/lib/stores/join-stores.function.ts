import {
  combineSelectors,
  createSelectorsCache,
  Flat,
  memoizeWithProxy,
  ReturnTypeSelectors,
  SelectorReturnTypes,
  Selectors,
  SelectorsCache,
} from '@state-adapt/core';
import { merge, using } from 'rxjs';
import { JoinedStore } from './joined-store.interface';
import { StoreLike } from './store-like.type';

type StoreEntries = {
  [index: string]: StoreLike<any, any, any>;
};

type StoreState<Store extends StoreLike<any, any, any>> = Store extends StoreLike<
  infer State,
  any,
  any
>
  ? State
  : never;

type EntriesState<SE extends StoreEntries> = {
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

type JoinedSelectors<SE extends StoreEntries> = SelectorsOfState<EntriesState<SE>> &
  ({
    [K in string & keyof SE]: (
      x: PrefixedSelectors<EntriesState<SE>, K, SE[K]['__']['fullSelectors']>,
    ) => void;
  }[string & keyof SE] extends (x: infer I) => void
    ? I
    : never);

// state => easy
// joined selectors => Map—Grab from each store, prefix object, do merge trick
//
export function joinStores<SE extends StoreEntries>(
  storeEntries: SE,
): NewBlockAdder<Flat<EntriesState<SE>>, JoinedSelectors<SE>, SE> {
  // The initial selectors defined in `combineSelectors` are selecting against State.
  // Here, we are defining the initial selectors. The result includes
  // a selector for each piece of state. The developer only defines the 2nd+ selector group.

  const namespaces = Object.keys(storeEntries) as (string & keyof SE)[];
  const joinedSelectors: Selectors<any> = {};

  const cache = createSelectorsCache();
  const getCacheOverride = (sharedChildCache: SelectorsCache) => {
    // Use this join's cache instead of the one from future joins
    // But register future joins' caches as children
    if (sharedChildCache) {
      cache.__children[sharedChildCache.__id] = sharedChildCache;
    }
    return cache;
  };

  joinedSelectors.state = memoizeWithProxy()(
    'state',
    joinedSelectors,
    s => {
      const newState = {} as any;
      namespaces.forEach(key => {
        newState[key] = s[key];
      });
      return newState;
    },
    getCacheOverride,
  );

  namespaces.forEach(namespace => {
    // Already cached selectors to be made available under new names
    // to be used in subsequent selector definitions.
    const fullSelectors = storeEntries[namespace].__.fullSelectors;
    for (const selectorName in fullSelectors) {
      const selector = fullSelectors[selectorName];
      if (selectorName === 'state') {
        joinedSelectors[namespace] = selector;
      } else {
        const newSelectorName = `${namespace}${
          selectorName.charAt(0).toUpperCase() + selectorName.substr(1)
        }`;
        joinedSelectors[newSelectorName] = selector;
      }
    }
  });

  return addNewBlock({
    storeEntries,
    namespaces,
    selectors: joinedSelectors,
    getCacheOverride,
  });
}

type StoreBuilder<State, S extends Selectors<State>, SE extends StoreEntries> = {
  storeEntries: SE;
  namespaces: (string & keyof SE)[];
  selectors: S;
  getCacheOverride: (c: SelectorsCache) => SelectorsCache;
};

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

type AddNewBlock<
  State,
  S extends Selectors<State>,
  SE extends StoreEntries,
  D extends Prev[number] = 19,
> = (
  builder: StoreBuilder<State, S, SE>,
) => D extends [never] ? S : NewBlockAdder<State, S, SE, D>;

interface NewBlockAdder<
  State,
  S extends Selectors<State>,
  SE extends StoreEntries,
  D extends Prev[number] = 19,
> {
  (): JoinedStore<State, S>;

  <NewBlock extends Selectors<SelectorReturnTypes<State, S>>>(
    newBlock: NewBlock,
  ): ReturnType<
    AddNewBlock<
      State,
      Flat<ReturnTypeSelectors<State, SelectorReturnTypes<State, S>, Flat<S & NewBlock>>>,
      SE,
      Prev[D]
    >
  >;
}

function addNewBlock<SB extends StoreBuilder<any, any, any>>(
  builder: SB,
): ReturnType<AddNewBlock<any, any, any>> {
  return <NewS extends Selectors<any>>(newS?: NewS) => {
    if (newS)
      return addNewBlock({
        ...builder,
        selectors: combineSelectors<any>()<any, any, any>(
          builder.selectors,
          newS,
          // These new selectors will ignore the cache objects (if any) given to them
          // Instead, attach that cache object as a child of this joined store's cache object
          builder.getCacheOverride,
        ),
      });

    // Done
    const { namespaces, selectors, storeEntries } = builder;
    const select = storeEntries[namespaces[0]].__.select;

    const requireAllSources$ = merge(
      ...namespaces.map(namespace => storeEntries[namespace].__.requireSources$),
    );

    const joinedStore = {
      __: {
        fullSelectors: selectors,
        requireSources$: requireAllSources$,
        select: select,
      },
    } as any;

    for (const selectorName in selectors) {
      joinedStore[selectorName + '$'] = using(
        () => requireAllSources$.subscribe(),
        () => select(selectors[selectorName]),
      );
    }

    return joinedStore;
  };
}
