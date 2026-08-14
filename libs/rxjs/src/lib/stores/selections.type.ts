import { Observable } from 'rxjs';
import { Selectors } from '@state-adapt/core';

export type Selections<State, S extends Selectors<State>> = {
  [P in keyof S as `${P extends string ? P : never}$`]: Observable<ReturnType<S[P]>>;
} & { state$: Observable<State> };
