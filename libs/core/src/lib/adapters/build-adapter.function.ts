import {
  combineSelectors,
  ReturnTypeSelectors,
  SelectorReturnTypes,
} from '../selectors/create-selectors.function';
import { WithStateSelector } from '../selectors/memoize-selectors.function';
import { Selectors } from '../selectors/selectors.interface';
import { FlatAnyKey } from '../utils/flat.type';
import { Adapter, ReactionsWithSelectors } from './adapter.type';
import {
  AdapterBuilder,
  BuiltAdapter,
  ReactionsWithoutSelectors,
} from './build-adapter.types';
import { BasicAdapterMethods, createAdapter } from './create-adapter.function';
import { Reactions } from './reactions.interface';

/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `buildAdapter`

  `buildAdapter` is called with an initial adapter, then can be called again and again with more objects inheriting from previous objects,
  until a final empty call `()` to get the final built adapter:

  ```typescript
  import { buildAdapter } from '@state-adapt/core';
  import { numberAdapter } from './number.adapter';

  const numberStringAdapter = buildAdapter<number>()(numberAdapter)({
    // Define more stuff
  })(([selectors, reactions]) => ({
    // Define more stuff
  }))({
    // etc
  })(); // End
  ```

  The first call creates a new object, but after that, every object passed in is looped over and used to mutate the original new object.

  [`buildAdapter`](/concepts/adapters#buildadapter) takes 3 possible arguments in each call (after the first):

  1. A selectors object
  2. A function taking in a tuple of `[selectors, reactions]` and returning new reactions
  3. A nested object defining grouped state reactions

  ### 1. Selectors

  [`buildAdapter`](/concepts/adapters#buildadapter) provides full selector memoization and a default `state` selector (after the first call).
  The selectors defined in the first call each receive a state object to select against. Each subsequent selector block has access to all
  selectors previously defined. To return all the selectors combined into an adapter, call it a final time with no parameter.

  #### Example: Basic selectors

  ```typescript
  import { buildAdapter } from '@state-adapt/core';

  const stringAdapter = buildAdapter<string>()({})({
    reverse: s => s.state.split('').reverse().join(''),
  })({
    isPalendrome: s => s.reverse === s.state,
  })();
  ```

  `s` is typed as an object with properties with the same names as all the selectors defined previously, and typed with each corresponding selector's
  return type. Internally, [`buildAdapter`](/concepts/adapters#buildadapter) uses a `Proxy` to detect which selectors your new selector functions are
  accessing in order memoize them efficiently.

  ### 2. Reactions

  #### Example: Basic Reactions

  ```typescript
  import { buildAdapter } from '@state-adapt/core';
  import { numberAdapter } from './number.adapter';

  const numberStringAdapter = buildAdapter<number>()(numberAdapter)({
    negativeStr: s => s.negative.toString(),
  })(([selectors, reactions]) => ({
    setToNegative: state => selectors.negative(state),
  }))();
  ```

  `setToNegative` becomes a reaction on `numberStringAdapter` that multiplies the state by `-1` (the return of `selectors.negative(state)`).

  Selectors used when defining new reactions must be called as functions and will not be memoized. If efficiency is critical, you might want to put the derived state in the action payload for the state change.

  ### 3. Grouped Reactions

  The nested object defining grouped state reactions is for nested states. In the following example, a group state reaction called `setBothNumbers` will set both `coolNumber` and `weirdNumber` to the same payload passed into the new `setBothNumbers` reaction.

  #### Example: Grouped Reactions

  ```typescript
  const numbersAdapter = buildAdapter<NumbersState>()({
    setCoolNumber: (state, newCoolNumber: number) => ({
      ...state,
      coolNumber: newCoolNumber,
    }),
    setWeirdNumber: (state, newWeirdNumber: number) => ({
      ...state,
      weirdNumber: newWeirdNumber,
    }),
  })({
    setBothNumbers: {
      coolNumber: numberAdapter.set,
      weirdNumber: numberAdapter.set,
    },
  })();
  ```

  The new reaction's payload type will be the intersection of the payload types from the reactions used, except when one of the payloads is `void`, in which case it will be ignored in the payload intersection.
 */
export function buildAdapter<State>() {
  return <S extends Selectors<State>, R extends ReactionsWithSelectors<State, S>>(
    reactionsWithSelectors: Adapter<State, S, R> = {} as Adapter<State, S, R>,
  ): NewBlockAdder<
    State,
    WithStateSelector<State, S>,
    ReactionsWithoutSelectors<State, R & BasicAdapterMethods<State>>
  > => {
    const adapter = createAdapter<State>()<S, R>(reactionsWithSelectors);
    return addNewBlock({ reactions: adapter, selectors: adapter.selectors });
  };
}

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export type AddNewBlock<
  State,
  S extends Selectors<State>,
  R extends Reactions<State>,
  D extends Prev[number] = 19,
> = (
  oldAdapterBuilder: AdapterBuilder<State, S, R>,
) => D extends [never] ? never : NewBlockAdder<State, S, R, D>;

export interface NewBlockAdder<
  State,
  S extends Selectors<State>,
  R extends Reactions<State>,
  D extends Prev[number] = 19,
> {
  (): FlatAnyKey<BuiltAdapter<State, R, S>>;

  <NewBlock extends (ar: [S, R]) => Reactions<State>>(
    newBlock: NewBlock,
  ): NewBlock extends (ar: [S, R]) => infer R2
    ? ReturnType<AddNewBlock<State, S, Omit<R, keyof R2> & R2, Prev[D]>>
    : never;

  <NewBlock extends Selectors<SelectorReturnTypes<State, S>>>(
    newBlock: NewBlock,
  ): ReturnType<
    AddNewBlock<
      State,
      FlatAnyKey<ReturnTypeSelectors<State, SelectorReturnTypes<State, S>, S & NewBlock>>,
      R,
      Prev[D]
    >
  >;

  <
    NewBlock extends {
      [index: string]: Partial<{
        [K in keyof State]: (
          state: State[K],
          payload: any,
          initialState: State[K],
        ) => State[K];
      }>;
    },
  >(
    newBlock: NewBlock,
  ): ReturnType<AddNewBlock<State, S, R & NestedReactions<State, NewBlock>, Prev[D]>>;
}

type NestedReactions<
  State,
  CRDef extends {
    [index: string]: Partial<{
      [K in keyof State]: (
        state: State[K],
        payload: any,
        initialState: State[K],
      ) => State[K];
    }>;
  },
> = {
  [K in keyof CRDef]: (
    state: State,
    payload: CRDef[K][keyof CRDef[K]] extends (
      state: any,
      payload: void & infer Payload,
      initialState: any,
    ) => any
      ? Payload
      : never,
    initialState: State,
  ) => State;
};

export function addNewBlock<AB extends AdapterBuilder<any, any, any>>(
  builder: AB,
): ReturnType<AddNewBlock<any, any, any>> {
  return <NewBlock extends Selectors<any> | ((ar: [any, any]) => Reactions<any>)>(
    newBlock?: NewBlock,
  ) => {
    // Done
    if (!newBlock) return { ...builder.reactions, selectors: builder.selectors };

    // New reactions
    if (typeof newBlock === 'function') {
      const newReactions = newBlock([builder.selectors, builder.reactions] as [any, any]);
      for (const prop in newReactions) {
        builder.reactions[prop] = newReactions[prop];
      }
      return addNewBlock(builder);
    }

    // Selectors and combined reactions
    let type: undefined | 'selectors' | 'nestedReactions';
    for (const prop in newBlock) {
      type = typeof newBlock[prop] === 'function' ? 'selectors' : 'nestedReactions';
      break;
    }

    // Selectors
    if (type === 'selectors') {
      // Mutates
      combineSelectors<any>()<any, any, any>(builder.selectors, newBlock);
      return addNewBlock(builder);
    }

    // Reactions
    for (const prop in newBlock) {
      const reactionGroup = newBlock[prop];
      builder.reactions[prop] = (state: any, payload: any, initialState: any) => {
        let newState;
        for (const subStateName in reactionGroup) {
          const subReaction = reactionGroup[subStateName] as any;
          const subState = state[subStateName];
          const newSubState = subReaction(subState, payload, initialState[subStateName]);
          if (subState !== newSubState) {
            newState = newState || { ...state };
            newState[subStateName] = newSubState;
          }
        }
        return newState || state;
      };
    }
    return addNewBlock(builder);
  };
}
