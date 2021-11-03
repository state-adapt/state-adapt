import { Observable } from 'rxjs';
import { Selectors } from './selectors.interface';

export type Selections<State, T extends Selectors<State>> = {
  [P in keyof T]: Observable<ReturnType<T[P]>>;
} & { state: Observable<State> };
