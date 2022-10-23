import { Selectors, WithGetState } from '@state-adapt/core';
import { Observable } from 'rxjs';
import { Selections } from '../stores/selections.type';

export type MiniStore<State, S extends Selectors<State>> = Selections<
  State,
  S & WithGetState<State>
> & {
  _requireSources$: Observable<any>;
  _fullSelectors: S & WithGetState<State>;
  // _selectors: S;
  _select: <State>(sel: any) => Observable<State>;
};
