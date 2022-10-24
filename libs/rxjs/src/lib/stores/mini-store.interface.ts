import { Selectors } from '@state-adapt/core';
import { Observable } from 'rxjs';
import { Selections } from '../stores/selections.type';

export type MiniStore<State, S extends Selectors<State>> = Selections<State, S> & {
  _requireSources$: Observable<any>;
  _fullSelectors: S;
  _select: <State>(sel: any) => Observable<State>;
};
