import { Selectors } from '@state-adapt/core';
import { Observable } from 'rxjs';
import { Selections } from '../stores/selections.type';

export type SmartStore<State, S extends Selectors<State>> = Selections<State, S> & {
  /**
   * Don't use this property directly. Intended for internal use only.
   */
  __: {
    requireSources$: Observable<any>;
    fullSelectors: S;
    selectors: S;
    initialState: State;
    select: <State>(sel: any) => Observable<State>;
  };
};
