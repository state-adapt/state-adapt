import { AnySelectors, Selectors, createSelector } from '@state-adapt/core';
import { merge, using } from 'rxjs';
import { JoinedMiniStore } from './joined-mini-store.interface';
import { JoinedSelectors } from './joined-selectors.type';
import { MiniStore } from './mini-store.interface';
import { StoreLike } from './store-like.type';

type SelectorKey<
  State,
  S extends Selectors<State>,
  AS extends AnySelectors,
> = keyof StoreLike<State, S, AS>['_fullSelectors'];

type StoreSelectorInput<
  State,
  S extends Selectors<State>,
  AS extends AnySelectors,
  SelectorKey1 extends SelectorKey<State, S, AS> = 'state',
> = StoreLike<State, S, AS> | [StoreLike<State, S, AS>, SelectorKey1];

/**
 * @deprecated Use buildSelectors
 */
export function joinSelectors<
  State1,
  State2,
  S1 extends Selectors<State1>,
  S2 extends Selectors<State2>,
  AS1 extends AnySelectors,
  AS2 extends AnySelectors,
  SelectorKey1 extends SelectorKey<State1, S1, AS1> = 'state',
  SelectorKey2 extends SelectorKey<State2, S2, AS2> = 'state',
  ReturnState1 extends ReturnType<
    StoreLike<State1, S1, AS1>['_fullSelectors'][SelectorKey1]
  > = ReturnType<StoreLike<State1, S1, AS1>['_fullSelectors'][SelectorKey1]>,
  ReturnState2 extends ReturnType<
    StoreLike<State2, S2, AS2>['_fullSelectors'][SelectorKey2]
  > = ReturnType<StoreLike<State2, S2, AS2>['_fullSelectors'][SelectorKey2]>,
  NewS extends AnySelectors = AnySelectors,
  NewState = [ReturnState1, ReturnState2],
>(
  selectorInput1: StoreSelectorInput<State1, S1, AS1, SelectorKey1>,
  selectorInput2: StoreSelectorInput<State2, S2, AS2, SelectorKey2>,
  newSelector?: (s1: ReturnState1, s2: ReturnState2) => NewState,
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
  SelectorKey1 extends SelectorKey<State1, S1, AS1> = 'state',
  SelectorKey2 extends SelectorKey<State2, S2, AS2> = 'state',
  SelectorKey3 extends SelectorKey<State3, S3, AS3> = 'state',
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
  NewState = [ReturnState1, ReturnState2, ReturnState3],
>(
  selectorInput1: StoreSelectorInput<State1, S1, AS1, SelectorKey1>,
  selectorInput2: StoreSelectorInput<State2, S2, AS2, SelectorKey2>,
  selectorInput3: StoreSelectorInput<State3, S3, AS3, SelectorKey3>,
  newSelector?: (s1: ReturnState1, s2: ReturnState2, s3: ReturnState3) => NewState,
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
  SelectorKey1 extends SelectorKey<State1, S1, AS1> = 'state',
  SelectorKey2 extends SelectorKey<State2, S2, AS2> = 'state',
  SelectorKey3 extends SelectorKey<State3, S3, AS3> = 'state',
  SelectorKey4 extends SelectorKey<State4, S4, AS4> = 'state',
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
  NewState = [ReturnState1, ReturnState2, ReturnState3, ReturnState4],
>(
  selectorInput1: StoreSelectorInput<State1, S1, AS1, SelectorKey1>,
  selectorInput2: StoreSelectorInput<State2, S2, AS2, SelectorKey2>,
  selectorInput3: StoreSelectorInput<State3, S3, AS3, SelectorKey3>,
  selectorInput4: StoreSelectorInput<State4, S4, AS4, SelectorKey4>,
  newSelector?: (
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
  SelectorKey1 extends SelectorKey<State1, S1, AS1> = 'state',
  SelectorKey2 extends SelectorKey<State2, S2, AS2> = 'state',
  SelectorKey3 extends SelectorKey<State3, S3, AS3> = 'state',
  SelectorKey4 extends SelectorKey<State4, S4, AS4> = 'state',
  SelectorKey5 extends SelectorKey<State5, S5, AS5> = 'state',
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
  NewState = [ReturnState1, ReturnState2, ReturnState3, ReturnState4, ReturnState5],
>(
  selectorInput1: StoreSelectorInput<State1, S1, AS1, SelectorKey1>,
  selectorInput2: StoreSelectorInput<State2, S2, AS2, SelectorKey2>,
  selectorInput3: StoreSelectorInput<State3, S3, AS3, SelectorKey3>,
  selectorInput4: StoreSelectorInput<State4, S4, AS4, SelectorKey4>,
  selectorInput5: StoreSelectorInput<State5, S5, AS5, SelectorKey5>,
  newSelector?: (
    s1: ReturnState1,
    s2: ReturnState2,
    s3: ReturnState3,
    s4: ReturnState4,
    s5: ReturnState5,
  ) => NewState,
): JoinedMiniStore<any, JoinedSelectors<NewS, NewState>>;

export function joinSelectors(...inputs: any[]): MiniStore<any, { state: any }> {
  const lastInput = inputs[inputs.length - 1];
  const newSelectorProvided = typeof lastInput === 'function';
  const newSelector = newSelectorProvided ? lastInput : (...states: any[]) => states;
  const defaultSelector = 'state';
  const inputSelectors = newSelectorProvided ? inputs.slice(0, -1) : inputs;
  const inputSelectorArrays = inputSelectors.map(input =>
    Array.isArray(input) ? input : [input, defaultSelector],
  );

  const select = inputSelectorArrays[0][0]._select;

  const state: ({ adapt }: { adapt: any }) => any = (createSelector as any)(
    [
      ...inputSelectorArrays.map(
        ([miniStore, selectorName]) => miniStore._fullSelectors[selectorName],
      ),
    ],
    newSelector,
  );

  const fullSelectors: { state: any } = { state };

  const requireAllSources$ = merge(
    ...inputSelectorArrays.map(([miniStore]) => miniStore._requireSources$),
  );

  const selections: { state$: any } = {
    state$: using(
      () => requireAllSources$.subscribe(),
      () => select(fullSelectors.state),
    ),
  };

  return {
    ...selections,
    _fullSelectors: fullSelectors,
    _requireSources$: requireAllSources$,
    _select: select,
  };
}
