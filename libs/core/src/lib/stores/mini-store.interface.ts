import { Observable } from 'rxjs';
import { Selections } from '../selectors/selections.type';
import { Selectors } from '../selectors/selectors.interface';

export type MiniStore<State, S extends Selectors<State>> = Selections<State, S> & {
  _requireSources$: Observable<any>;
  _fullSelectors: S;
  _select: <State>(sel: any) => Observable<State>;
};
