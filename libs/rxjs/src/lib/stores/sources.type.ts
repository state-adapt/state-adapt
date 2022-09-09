import {
  Action,
  ReactionsWithSelectors,
  SecondParameterOrAny,
  Selectors,
} from '@state-adapt/core';
import { Observable } from 'rxjs';

export type ActionPayload<
  R extends { [index: string]: any },
  K extends keyof R,
> = SecondParameterOrAny<Parameters<R[K]>>;

export type Sources<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
> = {
  [K in keyof R]?:
    | Observable<Action<ActionPayload<R, K>>>[]
    | Observable<Action<ActionPayload<R, K>>>;
};
