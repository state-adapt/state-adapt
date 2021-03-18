import { Observable } from 'rxjs';
import { SecondParameter } from './second-parameter.type';
import { Selectors } from './selectors.interface';

export type Selections<State, T extends Selectors<State>> = {
  [P in keyof T]: SecondParameter<Parameters<T[P]>> extends void
    ? () => Observable<ReturnType<T[P]>>
    : (
        props: SecondParameter<Parameters<T[P]>>,
      ) => Observable<ReturnType<T[P]>>;
} & { getState: () => Observable<State> };
