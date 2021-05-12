import { Observable } from 'rxjs';
import { Action } from './action.interface';
import { SecondParameter } from './second-parameter.type';
import { Selectors } from './selectors.interface';
import { ReactionsWithSelectors } from './adapter.type';

type ActionPayload<
  R extends { [index: string]: any },
  K extends keyof R
> = SecondParameter<Parameters<R[K]>>;

export type Sources<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>
> = {
  [K in keyof R]?:
    | Observable<Action<ActionPayload<R, K>>>[]
    | Observable<Action<ActionPayload<R, K>>>;
};
