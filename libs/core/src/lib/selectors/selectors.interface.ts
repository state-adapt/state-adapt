import { Selector } from 'reselect';

export interface Selectors<State> {
  [index: string]: (state: State) => any;
}
