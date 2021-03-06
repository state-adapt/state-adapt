import { createSelector } from 'reselect';
import { merge, using } from 'rxjs';
import { AnySelectors } from './any-selectors.interface';
import { JoinedMiniStore } from './joined-mini-store.interface';
import { JoinedSelectors } from './joined-selectors.type';
import { MiniStore } from './mini-store.interface';
import { Selectors } from './selectors.interface';
import { StoreLike } from './store-like.type';

type StoreSelectorInput<
  State1,
  S1 extends Selectors<State1>,
  AS1 extends AnySelectors,
  SelectorKey1 extends keyof S1 = 'getState'
> = StoreLike<State1, S1, AS1> | [StoreLike<State1, S1, AS1>, SelectorKey1];

export function joinSelectors<
  State1,
  State2,
  S1 extends Selectors<State1>,
  S2 extends Selectors<State2>,
  AS1 extends AnySelectors,
  AS2 extends AnySelectors,
  SelectorKey1 extends keyof StoreLike<State1, S1, AS1> = 'getState',
  SelectorKey2 extends keyof StoreLike<State2, S2, AS2> = 'getState',
  ReturnState1 extends ReturnType<
    StoreLike<State1, S1, AS1>['_fullSelectors'][SelectorKey1]
  > = ReturnType<StoreLike<State1, S1, AS1>['_fullSelectors'][SelectorKey1]>,
  ReturnState2 extends ReturnType<
    StoreLike<State2, S2, AS2>['_fullSelectors'][SelectorKey2]
  > = ReturnType<StoreLike<State2, S2, AS2>['_fullSelectors'][SelectorKey2]>,
  NewS extends AnySelectors = AnySelectors,
  NewState = any
>(
  selectorInput1: StoreSelectorInput<State1, S1, AS1, SelectorKey1>,
  selectorInput2: StoreSelectorInput<State2, S2, AS2, SelectorKey2>,
  newSelector: (s1: ReturnState1, s2: ReturnState2) => NewState,
): JoinedMiniStore<any, JoinedSelectors<NewS, NewState>>;

export function joinSelectors<
  State1,
  State2,
  State3,
  S1 extends Selectors<State1>,
  S2 extends Selectors<State2>,
  S3 extends Selectors<State3>,
  AS1 extends AnySelectors,
  AS2 extends AnySelectors,
  AS3 extends AnySelectors,
  SelectorKey1 extends keyof StoreLike<State1, S1, AS1> = 'getState',
  SelectorKey2 extends keyof StoreLike<State2, S2, AS2> = 'getState',
  SelectorKey3 extends keyof StoreLike<State3, S3, AS3> = 'getState',
  ReturnState1 extends ReturnType<
    StoreLike<State1, S1, AS1>['_fullSelectors'][SelectorKey1]
  > = ReturnType<StoreLike<State1, S1, AS1>['_fullSelectors'][SelectorKey1]>,
  ReturnState2 extends ReturnType<
    StoreLike<State2, S2, AS2>['_fullSelectors'][SelectorKey2]
  > = ReturnType<StoreLike<State2, S2, AS2>['_fullSelectors'][SelectorKey2]>,
  ReturnState3 extends ReturnType<
    StoreLike<State3, S3, AS3>['_fullSelectors'][SelectorKey3]
  > = ReturnType<StoreLike<State3, S3, AS3>['_fullSelectors'][SelectorKey3]>,
  NewS extends AnySelectors = AnySelectors,
  NewState = any
>(
  selectorInput1: StoreSelectorInput<State1, S1, AS1, SelectorKey1>,
  selectorInput2: StoreSelectorInput<State2, S2, AS2, SelectorKey2>,
  selectorInput3: StoreSelectorInput<State3, S3, AS3, SelectorKey3>,
  newSelector: (
    s1: ReturnState1,
    s2: ReturnState2,
    s3: ReturnState3,
  ) => NewState,
): JoinedMiniStore<any, JoinedSelectors<NewS, NewState>>;

export function joinSelectors<
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
  SelectorKey1 extends keyof StoreLike<State1, S1, AS1> = 'getState',
  SelectorKey2 extends keyof StoreLike<State2, S2, AS2> = 'getState',
  SelectorKey3 extends keyof StoreLike<State3, S3, AS3> = 'getState',
  SelectorKey4 extends keyof StoreLike<State4, S4, AS4> = 'getState',
  ReturnState1 extends ReturnType<
    StoreLike<State1, S1, AS1>['_fullSelectors'][SelectorKey1]
  > = ReturnType<StoreLike<State1, S1, AS1>['_fullSelectors'][SelectorKey1]>,
  ReturnState2 extends ReturnType<
    StoreLike<State2, S2, AS2>['_fullSelectors'][SelectorKey2]
  > = ReturnType<StoreLike<State2, S2, AS2>['_fullSelectors'][SelectorKey2]>,
  ReturnState3 extends ReturnType<
    StoreLike<State3, S3, AS3>['_fullSelectors'][SelectorKey3]
  > = ReturnType<StoreLike<State3, S3, AS3>['_fullSelectors'][SelectorKey3]>,
  ReturnState4 extends ReturnType<
    StoreLike<State4, S4, AS4>['_fullSelectors'][SelectorKey4]
  > = ReturnType<StoreLike<State4, S4, AS4>['_fullSelectors'][SelectorKey4]>,
  NewS extends AnySelectors = AnySelectors,
  NewState = any
>(
  selectorInput1: StoreSelectorInput<State1, S1, AS1, SelectorKey1>,
  selectorInput2: StoreSelectorInput<State2, S2, AS2, SelectorKey2>,
  selectorInput3: StoreSelectorInput<State3, S3, AS3, SelectorKey3>,
  selectorInput4: StoreSelectorInput<State4, S4, AS4, SelectorKey4>,
  newSelector: (
    s1: ReturnState1,
    s2: ReturnState2,
    s3: ReturnState3,
    s4: ReturnState4,
  ) => NewState,
): JoinedMiniStore<any, JoinedSelectors<NewS, NewState>>;

export function joinSelectors<
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
  SelectorKey1 extends keyof StoreLike<State1, S1, AS1> = 'getState',
  SelectorKey2 extends keyof StoreLike<State2, S2, AS2> = 'getState',
  SelectorKey3 extends keyof StoreLike<State3, S3, AS3> = 'getState',
  SelectorKey4 extends keyof StoreLike<State4, S4, AS4> = 'getState',
  SelectorKey5 extends keyof StoreLike<State5, S5, AS5> = 'getState',
  ReturnState1 extends ReturnType<
    StoreLike<State1, S1, AS1>['_fullSelectors'][SelectorKey1]
  > = ReturnType<StoreLike<State1, S1, AS1>['_fullSelectors'][SelectorKey1]>,
  ReturnState2 extends ReturnType<
    StoreLike<State2, S2, AS2>['_fullSelectors'][SelectorKey2]
  > = ReturnType<StoreLike<State2, S2, AS2>['_fullSelectors'][SelectorKey2]>,
  ReturnState3 extends ReturnType<
    StoreLike<State3, S3, AS3>['_fullSelectors'][SelectorKey3]
  > = ReturnType<StoreLike<State3, S3, AS3>['_fullSelectors'][SelectorKey3]>,
  ReturnState4 extends ReturnType<
    StoreLike<State4, S4, AS4>['_fullSelectors'][SelectorKey4]
  > = ReturnType<StoreLike<State4, S4, AS4>['_fullSelectors'][SelectorKey4]>,
  ReturnState5 extends ReturnType<
    StoreLike<State5, S5, AS5>['_fullSelectors'][SelectorKey5]
  > = ReturnType<StoreLike<State5, S5, AS5>['_fullSelectors'][SelectorKey5]>,
  NewS extends AnySelectors = AnySelectors,
  NewState = any
>(
  selectorInput1: StoreSelectorInput<State1, S1, AS1, SelectorKey1>,
  selectorInput2: StoreSelectorInput<State2, S2, AS2, SelectorKey2>,
  selectorInput3: StoreSelectorInput<State3, S3, AS3, SelectorKey3>,
  selectorInput4: StoreSelectorInput<State4, S4, AS4, SelectorKey4>,
  selectorInput5: StoreSelectorInput<State5, S5, AS5, SelectorKey5>,
  newSelector: (
    s1: ReturnState1,
    s2: ReturnState2,
    s3: ReturnState3,
    s4: ReturnState4,
    s5: ReturnState5,
  ) => NewState,
): JoinedMiniStore<any, JoinedSelectors<NewS, NewState>>;

export function joinSelectors(
  ...inputs: any[]
): MiniStore<any, { getState: any }> {
  const inputSelectors = inputs
    .slice(0, -1)
    .map(input => (Array.isArray(input) ? input : [input, 'getState']));
  const select = inputSelectors[0][0]._select;
  const newSelector = inputs[inputs.length - 1];

  const getState: ({ adapt }: { adapt: any }) => any = (createSelector as any)(
    [
      ...inputSelectors.map(
        ([miniStore, selectorName]) => miniStore._fullSelectors[selectorName],
      ),
    ],
    newSelector,
  );

  const fullSelectors: { getState: any } = { getState };

  const requireAllSources$ = merge(
    ...inputSelectors.map(([miniStore]) => miniStore._requireSources$),
  );

  const selections: { getState: any } = {
    getState: () =>
      using(
        () => requireAllSources$.subscribe(),
        () => select(fullSelectors.getState),
      ),
  };

  return {
    ...selections,
    _fullSelectors: fullSelectors,
    _requireSources$: requireAllSources$,
    _select: select,
  };
}
