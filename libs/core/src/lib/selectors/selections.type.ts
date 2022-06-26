import { Observable } from 'rxjs';
import { Selectors } from './selectors.interface';

export type Selections<State, T extends Selectors<State>> = {
  [P in keyof T as `${P extends string ? P : never}$`]: Observable<ReturnType<T[P]>>;
} & { state$: Observable<State> };
