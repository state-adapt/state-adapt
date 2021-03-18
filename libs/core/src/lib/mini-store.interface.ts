import { Observable } from 'rxjs';
import { Selections } from './selections.type';
import { Selectors } from './selectors.interface';

export type MiniStore<State, S1 extends Selectors<State>> = Selections<
  State,
  S1
> & {
  _requireSources$: Observable<any>;
  _fullSelectors: S1;
  _select: <State>(sel: any) => Observable<State>;
};
