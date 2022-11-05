import {
  combineSelectors,
  ReturnTypeSelectors,
  SelectorReturnTypes,
} from '../selectors/create-selectors.function';
import { WithStateSelector } from '../selectors/memoize-selectors.function';
import { Selectors } from '../selectors/selectors.interface';
import { FlatAnyKey } from '../utils/flat.type';
import { Adapter, ReactionsWithSelectors } from './adapter.type';
import { BasicAdapterMethods, createAdapter } from './create-adapter.function';
import { Reaction } from './reaction.type';
import { Reactions } from './reactions.interface';

export interface AdapterBuilder<
  State,
  S extends Selectors<State>,
  R extends Reactions<State>,
> {
  selectors: S;
  reactions: R;
}

export type BuiltAdapter<
  State,
  R extends Reactions<State>,
  S extends Selectors<State>,
> = {
  [K in keyof R | 'selectors']: K extends 'selectors' ? S : R[K];
};

export type ReactionsWithoutSelectors<
  State,
  R extends ReactionsWithSelectors<State, any>,
> = {
  [K in keyof R]: K extends 'selectors'
    ? never
    : R[K] extends Reaction<State>
    ? R[K]
    : never;
};

export type ReactionsFromAdapter<A extends Adapter<any, any, any>> = {
  [K in keyof A]: A[K] extends Reaction<any> ? A[K] : never;
};

export function buildAdapter<State>() {
  return <
    S extends Selectors<State> = {},
    R extends ReactionsWithSelectors<State, S> = {},
  >(
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
