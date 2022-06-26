import { Selector } from 'reselect';

export interface Selectors<State> {
  [index: string]: (state: State, props?: any) => any | Selector<State, any>;
}
