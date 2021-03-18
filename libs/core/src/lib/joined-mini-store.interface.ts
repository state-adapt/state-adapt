import { Observable } from 'rxjs';
import { AnySelectors } from './any-selectors.interface';
import { Selections } from './selections.type';

export type JoinedMiniStore<State, S1 extends AnySelectors> = Selections<
  State,
  S1
> & {
  _requireSources$: Observable<any>;
  _fullSelectors: S1;
  _select: <State>(sel: any) => Observable<State>;
};
