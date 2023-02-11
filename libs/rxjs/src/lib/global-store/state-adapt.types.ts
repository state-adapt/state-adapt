import {
  BasicAdapterMethods,
  ReactionsWithSelectors,
  Selectors,
  WithNoopReaction,
  WithUpdateReaction,
} from '@state-adapt/core';
import { Observable } from 'rxjs';

export interface GlobalStoreMethods {
  select: (sel: any) => Observable<any>;
  dispatch: (action: any) => any;
}

export type InitializedReactions<
  State,
  S extends Selectors<State> = {},
  R extends ReactionsWithSelectors<State, S> = {},
> = R &
  BasicAdapterMethods<State> &
  (State extends object ? WithUpdateReaction<State> : {}) &
  WithNoopReaction<State>;
