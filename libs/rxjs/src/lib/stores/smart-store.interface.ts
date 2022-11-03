import { Selectors } from '@state-adapt/core';
import { Observable } from 'rxjs';
import { Selections } from '../stores/selections.type';

export type SmartStore<State, S extends Selectors<State>> = Selections<State, S> & {
  __: {
    requireSources$: Observable<any>;
    fullSelectors: S;
    select: <State>(sel: any) => Observable<State>;
  };
};
