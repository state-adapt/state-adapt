import { Observable } from 'rxjs';
import { AnySelectors } from '@state-adapt/core';
import { Selections } from '../stores/selections.type';

export type JoinedMiniStore<State, S1 extends AnySelectors> = Selections<State, S1> & {
  _requireSources$: Observable<any>;
  _fullSelectors: S1;
  _select: <State>(sel: any) => Observable<State>;
};
