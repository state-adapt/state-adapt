import { Selector } from 'reselect';

export interface AnySelectors {
  [index: string]: (state: any) => any;
}
