import { MemoizedSelector } from '@ngrx/store';

export interface Selectors<State> {
  [index: string]: (
    state: State,
    props?: any,
  ) => any | MemoizedSelector<State, any>;
}
