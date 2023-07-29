import {
  Action,
  BasicAdapterMethods,
  ReactionsWithSelectors,
  Selectors,
  SyntheticSources,
  WithGetState,
  WithNoopReaction,
  WithUpdateReaction,
} from '@state-adapt/core';
import { Observable } from 'rxjs';
import { Sources } from '../stores/sources.type';
import { SmartStore } from '../stores/smart-store.interface';

export interface GlobalStoreMethods {
  select: (sel: any) => Observable<any>;
  dispatch: (action: any) => any;
}

export type SourceArg<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
> =
  | Sources<State, S, InitializedReactions<State, S, R>>
  | Observable<Action<State>>
  | Observable<Action<State>>[]
  | ((
      detachedStore: SmartStore<State, S & WithGetState<State>>,
    ) => SourceArg<State, S, R>);

export type InitializedReactions<
  State,
  S extends Selectors<State> = {},
  R extends ReactionsWithSelectors<State, S> = {},
> = R &
  BasicAdapterMethods<State> &
  (State extends object ? WithUpdateReaction<State> : {}) &
  WithNoopReaction<State>;

export type InitializedSmartStore<
  State,
  S extends Selectors<State> = {},
  R extends ReactionsWithSelectors<State, S> = {},
> = SmartStore<State, S & WithGetState<State>> &
  SyntheticSources<InitializedReactions<State, S, R>>;
