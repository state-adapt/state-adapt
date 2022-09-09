import { AnySelectors } from '@state-adapt/core';

export type JoinedSelectors<AS extends AnySelectors, JoinedState> = AS & {
  state: (state: any) => JoinedState;
};
