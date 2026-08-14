import { WritableSignal } from '@angular/core';
import { Selectors } from '@state-adapt/core';

export type StoreSignals<State, S extends Selectors<State>> = WritableSignal<State> & {
  [K in keyof S]: () => ReturnType<S[K]>;
};
