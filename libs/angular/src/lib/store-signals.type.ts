import { Selectors } from '@state-adapt/core';

export type StoreSignals<State, S extends Selectors<State>> = {
  (): State;
  readOnce: () => State;
} & {
  [K in keyof S]: () => ReturnType<S[K]>;
};
