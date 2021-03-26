import { Observable } from 'rxjs';
import { Action } from './action.interface';
import { SecondParameter } from './second-parameter.type';
import { Selectors } from './selectors.interface';
import { ReactionsWithGetSelectors } from './adapter.type';

export type Sources<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithGetSelectors<State, S>
> = {
  [K in keyof R]?:
    | Observable<Action<SecondParameter<Parameters<R[K]>>>>[]
    | Observable<Action<SecondParameter<Parameters<R[K]>>>>;
};
