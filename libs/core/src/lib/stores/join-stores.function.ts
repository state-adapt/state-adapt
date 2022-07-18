import { merge, using } from 'rxjs';
import { createSelector } from '../selectors/create-selector.function';
import {
  combineSelectors,
  ReturnTypeSelectors,
  SelectorReturnTypes,
} from '../selectors/create-selectors.function';
import { Selectors } from '../selectors/selectors.interface';
import { Flat } from '../utils/flat.type';
import { JoinedMiniStore } from './joined-mini-store.interface';
// import { JoinedSelectors } from './joined-selectors.type';
import { StoreLike } from './store-like.type';

type StoreEntries = {
  [index: string]: StoreLike<any, any, any>;
};

// type StoreSelectors<Store extends StoreLike<any, any, any,>> = Store['_fullSelectors'];

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
      x: PrefixedSelectors<EntriesState<SE>, K, SE[K]['_fullSelectors']>,
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
  // The initial selectors defined in `buildSelectors` are selecting against State.
  // Here, we are defining the initial selectors. The result includes
  // a selector for each piece of state. The developer only defines the 2nd+ selector group.

  const namespaces = Object.keys(storeEntries) as (string & keyof SE)[];

  const joinedSelectors: Selectors<any> = {};
  namespaces.forEach(namespace => {
    const fullSelectors = storeEntries[namespace]._fullSelectors;
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
  });
}

type StoreBuilder<State, S extends Selectors<State>, SE extends StoreEntries> = {
  storeEntries: SE;
  namespaces: (string & keyof SE)[];
  selectors: S;
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
  (): JoinedMiniStore<State, S>;

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
        selectors: combineSelectors<any>()<any, any, any>(builder.selectors, newS),
      });

    // Done
    const { namespaces, selectors, storeEntries } = builder;

    console.log(namespaces, selectors, storeEntries);

    // addNewBlock 1st call is always a new copy from joinStores
    selectors.state = createSelector(
      namespaces.map(namespace => selectors[namespace]),
      (...states: any[]) => {
        const state = {} as any;
        namespaces.forEach((namespace, i) => {
          state[namespace] = selectors[namespace](states[i]);
        });
        return state;
      },
    );

    const select = storeEntries[namespaces[0]]._select;

    const requireAllSources$ = merge(
      ...namespaces.map(namespace => storeEntries[namespace]._requireSources$),
    );

    const selections = {} as any;
    for (const selectorName in selectors) {
      selections[selectorName + '$'] = using(
        () => requireAllSources$.subscribe(),
        () => select(selectors[selectorName]),
      );
    }

    return {
      ...selections,
      _fullSelectors: selectors,
      _requireSources$: requireAllSources$,
      _select: select,
    };
  };
}
