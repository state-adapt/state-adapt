import { Observable } from 'rxjs';
import { Action } from './action.interface';
import { SecondParameterOrAny } from './second-parameter-or-any.type';
import { Selectors } from './selectors.interface';
import { ReactionsWithSelectors } from './adapter.type';

export type ActionPayload<
  R extends { [index: string]: any },
  K extends keyof R
> = SecondParameterOrAny<Parameters<R[K]>>;

export type Sources<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>
> = {
  [K in keyof R]?:
    | Observable<Action<ActionPayload<R, K>>>[]
    | Observable<Action<ActionPayload<R, K>>>;
};
