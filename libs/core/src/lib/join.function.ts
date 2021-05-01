import { createSelector } from 'reselect';
import { merge, using } from 'rxjs';
import { AnySelectors } from './any-selectors.interface';
import { JoinedMiniStore } from './joined-mini-store.interface';
import { JoinedSelectors } from './joined-selectors.type';
import { MiniStore } from './mini-store.interface';
import { Selections } from './selections.type';
import { Selectors } from './selectors.interface';
import { StoreLike } from './store-like.type';

export function join<
  State1,
  State2,
  S1 extends Selectors<State1>,
  S2 extends Selectors<State2>,
  AS1 extends AnySelectors,
  AS2 extends AnySelectors,
  NewS extends AnySelectors
>(
  store1: StoreLike<State1, S1, AS1>,
  store2: StoreLike<State2, S2, AS2>,
  getSelectors: (s1: S1, s2: S2) => NewS,
): JoinedMiniStore<any, JoinedSelectors<NewS, [State1, State2]>>;
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
  NewS extends Selectors<NewS>
>(
  store1: StoreLike<State1, S1, AS1>,
  store2: StoreLike<State2, S2, AS2>,
  store3: StoreLike<State3, S3, AS3>,
  getSelectors: (s1: S1, s2: S2, s3: S3) => NewS,
): JoinedMiniStore<any, JoinedSelectors<NewS, [State1, State2, State3]>>;
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
  NewS extends Selectors<NewS>
>(
  store1: StoreLike<State1, S1, AS1>,
  store2: StoreLike<State2, S2, AS2>,
  store3: StoreLike<State3, S3, AS3>,
  store4: StoreLike<State4, S4, AS4>,
  getSelectors: (s1: S1, s2: S2, s3: S3, s4: S4) => NewS,
): JoinedMiniStore<
  any,
  JoinedSelectors<NewS, [State1, State2, State3, State4]>
>;
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
  NewS extends Selectors<NewS>
>(
  store1: StoreLike<State1, S1, AS1>,
  store2: StoreLike<State2, S2, AS2>,
  store3: StoreLike<State3, S3, AS3>,
  store4: StoreLike<State4, S4, AS4>,
  store5: StoreLike<State5, S5, AS5>,
  getSelectors: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5) => NewS,
): JoinedMiniStore<
  any,
  JoinedSelectors<NewS, [State1, State2, State3, State4, State5]>
>;

export function join<NewS extends Selectors<any>>(
  ...inputs: any[]
): MiniStore<any, NewS> {
  const miniStores = inputs.slice(0, -1);
  const select = miniStores[0]._select;
  const getSelectors = inputs[inputs.length - 1];

  const getState: ({ adapt }: { adapt: any }) => any = (createSelector as any)(
    [...miniStores.map(({ _fullSelectors }) => _fullSelectors.getState)],
    (...results: any[]) => results,
  );

  const fullSelectors: NewS = {
    ...getSelectors(...miniStores.map(({ _fullSelectors }) => _fullSelectors)),
    getState,
  };
  const requireAllSources$ = merge(
    ...miniStores.map(({ _requireSources$ }) => _requireSources$),
  );

  const selections = Object.keys(fullSelectors).reduce(
    (selections, key) => ({
      ...selections,
      [key]: () =>
        using(
          () => requireAllSources$.subscribe(),
          () => select(fullSelectors[key]),
        ),
    }),
    {} as Selections<any, NewS>,
  );

  return {
    ...selections,
    _fullSelectors: fullSelectors,
    _requireSources$: requireAllSources$,
    _select: select,
  };
}
