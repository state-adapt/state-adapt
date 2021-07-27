import { Observable } from 'rxjs';
import { SecondParameterOrVoid } from './second-parameter-or-void.type';
import { Selectors } from './selectors.interface';

export type Selections<State, T extends Selectors<State>> = {
  [P in keyof T]: SecondParameterOrVoid<Parameters<T[P]>> extends void
    ? () => Observable<ReturnType<T[P]>>
    : (
        props: SecondParameterOrVoid<Parameters<T[P]>>,
      ) => Observable<ReturnType<T[P]>>;
} & { getState: () => Observable<State> };
