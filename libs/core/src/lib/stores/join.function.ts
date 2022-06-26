import { createSelector } from 'reselect';
import { merge, using } from 'rxjs';
// import { AnySelectors } from '../selectors/any-selectors.interface';
import {
  createSelectors,
  SelectorReturnTypes,
} from '../selectors/create-selectors.function';
import { Selections } from '../selectors/selections.type';
import { JoinedMiniStore } from './joined-mini-store.interface';
import { JoinedSelectors } from './joined-selectors.type';
import { MiniStore } from './mini-store.interface';
// import { Selectors } from '../selectors/selectors.interface';
import { StoreLike } from './store-like.type';

interface Selectors<State> {
  [index: string]: (state: State, props?: any) => any;
}

interface AnySelectors {
  [index: string]: (state: any) => any;
}

type Prefixed<Prefix extends string, S> = {
  [Key in keyof S as `${Prefix}${Capitalize<Key extends string ? Key : never>}`]: S[Key];
};

export function join<
  State1,
  State2,
  S1 extends Selectors<State1>,
  S2 extends Selectors<State2>,
  AS1 extends AnySelectors,
  AS2 extends AnySelectors,
  Prefix1 extends string,
  Prefix2 extends string,
  PrefixedSelectors extends Prefixed<Prefix1, S1> & Prefixed<Prefix2, S2>,
  PrefixedState extends SelectorReturnTypes<
    Prefixed<Prefix1, State1> & Prefixed<Prefix2, State2>,
    PrefixedSelectors
  >,
  NewS extends Selectors<PrefixedState>,
  CombinedS extends NewS & PrefixedSelectors,
>(
  store1: [Prefix1, StoreLike<State1, S1, AS1>],
  store2: [Prefix2, StoreLike<State2, S2, AS2>],
  newSelectors: NewS,
): JoinedMiniStore<any, JoinedSelectors<CombinedS, [State1, State2]>>;
export function join<
  State1,
  State2,
  State3,
  S1 extends Selectors<State1>,
  S2 extends Selectors<State2>,
  S3 extends Selectors<State3>,
  AS1 extends AnySelectors,
  AS2 extends AnySelectors,
  AS3 extends AnySelectors,
  Prefix1 extends string,
  Prefix2 extends string,
  Prefix3 extends string,
  PrefixedSelectors extends Prefixed<Prefix1, S1> &
    Prefixed<Prefix2, S2> &
    Prefixed<Prefix3, S3>,
  PrefixedState extends SelectorReturnTypes<
    Prefixed<Prefix1, State1> & Prefixed<Prefix2, State2> & Prefixed<Prefix3, State3>,
    PrefixedSelectors
  >,
  NewS extends Selectors<PrefixedState>,
  CombinedS extends NewS & PrefixedSelectors,
>(
  store1: [Prefix1, StoreLike<State1, S1, AS1>],
  store2: [Prefix2, StoreLike<State2, S2, AS2>],
  store3: [Prefix3, StoreLike<State3, S3, AS3>],
  newSelectors: NewS,
): JoinedMiniStore<any, JoinedSelectors<CombinedS, [State1, State2, State3]>>;
export function join<
  State1,
  State2,
  State3,
  State4,
  S1 extends Selectors<State1>,
  S2 extends Selectors<State2>,
  S3 extends Selectors<State3>,
  S4 extends Selectors<State4>,
  AS1 extends AnySelectors,
  AS2 extends AnySelectors,
  AS3 extends AnySelectors,
  AS4 extends AnySelectors,
  Prefix1 extends string,
  Prefix2 extends string,
  Prefix3 extends string,
  Prefix4 extends string,
  PrefixedSelectors extends Prefixed<Prefix1, S1> &
    Prefixed<Prefix2, S2> &
    Prefixed<Prefix3, S3> &
    Prefixed<Prefix4, S4>,
  PrefixedState extends SelectorReturnTypes<
    Prefixed<Prefix1, State1> &
      Prefixed<Prefix2, State2> &
      Prefixed<Prefix3, State3> &
      Prefixed<Prefix4, State4>,
    PrefixedSelectors
  >,
  NewS extends Selectors<PrefixedState>,
  CombinedS extends NewS & PrefixedSelectors,
>(
  store1: [Prefix1, StoreLike<State1, S1, AS1>],
  store2: [Prefix2, StoreLike<State2, S2, AS2>],
  store3: [Prefix3, StoreLike<State3, S3, AS3>],
  store4: [Prefix4, StoreLike<State4, S4, AS4>],
  newSelectors: NewS,
): JoinedMiniStore<any, JoinedSelectors<CombinedS, [State1, State2, State3, State4]>>;
export function join<
  State1,
  State2,
  State3,
  State4,
  State5,
  S1 extends Selectors<State1>,
  S2 extends Selectors<State2>,
  S3 extends Selectors<State3>,
  S4 extends Selectors<State4>,
  S5 extends Selectors<State5>,
  AS1 extends AnySelectors,
  AS2 extends AnySelectors,
  AS3 extends AnySelectors,
  AS4 extends AnySelectors,
  AS5 extends AnySelectors,
  Prefix1 extends string,
  Prefix2 extends string,
  Prefix3 extends string,
  Prefix4 extends string,
  Prefix5 extends string,
  PrefixedSelectors extends Prefixed<Prefix1, S1> &
    Prefixed<Prefix2, S2> &
    Prefixed<Prefix3, S3> &
    Prefixed<Prefix4, S4> &
    Prefixed<Prefix5, S5>,
  PrefixedState extends SelectorReturnTypes<
    Prefixed<Prefix1, State1> &
      Prefixed<Prefix2, State2> &
      Prefixed<Prefix3, State3> &
      Prefixed<Prefix4, State4> &
      Prefixed<Prefix5, State5>,
    PrefixedSelectors
  >,
  NewS extends Selectors<PrefixedState>,
  CombinedS extends NewS & PrefixedSelectors,
>(
  store1: [Prefix1, StoreLike<State1, S1, AS1>],
  store2: [Prefix2, StoreLike<State2, S2, AS2>],
  store3: [Prefix3, StoreLike<State3, S3, AS3>],
  store4: [Prefix4, StoreLike<State4, S4, AS4>],
  store5: [Prefix5, StoreLike<State5, S5, AS5>],
  newSelectors: NewS,
): JoinedMiniStore<
  any,
  JoinedSelectors<CombinedS, [State1, State2, State3, State4, State5]>
>;

export function join<CombinedS extends Selectors<any>>(
  ...inputs: any[]
): MiniStore<any, CombinedS> {
  const miniStoreInputs = inputs.slice(0, -1);
  const select = miniStoreInputs[0][1]._select;
  const newSelectors = inputs[inputs.length - 1];

  const getState: ({ adapt }: { adapt: any }) => any = (createSelector as any)(
    [...miniStoreInputs.map(([prefix, miniStore]) => miniStore._fullSelectors.state)],
    (...results: any[]) => results,
  );

  const combinedStoreSelectors = miniStoreInputs.reduce(
    (combined, [prefix, miniStore]) => ({
      ...combined,
      ...prefixObjectKeys(prefix, miniStore._fullSelectors),
    }),
    {} as any,
  );

  const fullSelectors: any = {
    ...createSelectors<any>()(combinedStoreSelectors, newSelectors),
    state: getState,
  };
  const requireAllSources$ = merge(
    ...miniStoreInputs.map(([prefix, miniStore]) => miniStore._requireSources$),
  );

  const selections = Object.keys(fullSelectors).reduce(
    (selections, key) => ({
      ...selections,
      [key + '$']: using(
        () => requireAllSources$.subscribe(),
        () => select(fullSelectors[key]),
      ),
    }),
    {} as Selections<any, CombinedS>,
  );

  return {
    ...selections,
    _fullSelectors: fullSelectors,
    _requireSources$: requireAllSources$,
    _select: select,
  };
}

function prefixObjectKeys<Prefix extends string, T>(
  prefix: Prefix,
  obj: T,
): Prefixed<Prefix, T> {
  return Object.entries(obj).reduce(
    (newObj, [key, value]) => ({ ...newObj, [`${prefix}${capitalize(key)}`]: value }),
    {} as Prefixed<Prefix, T>,
  );
}

function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}
