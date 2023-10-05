import { Observable } from 'rxjs';
import { Selectors } from '@state-adapt/core';

export type Selections<State, S extends Selectors<State>> = {
  [P in keyof S as `${P extends string ? P : never}$`]: Observable<
    Exclude<ReturnType<S[P]>, undefined>
  >;
} & { state$: Observable<State> };
