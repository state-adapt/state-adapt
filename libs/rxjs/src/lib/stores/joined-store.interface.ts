import { Observable } from 'rxjs';
import { AnySelectors } from '@state-adapt/core';
import { Selections } from '../stores/selections.type';

export type JoinedStore<State, S1 extends AnySelectors> = Selections<State, S1> & {
  __: {
    requireSources$: Observable<any>;
    fullSelectors: S1;
    select: <State>(sel: any) => Observable<State>;
  };
};
