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
> = ({} extends R ? {} : R) &
  BasicAdapterMethods<State> &
  (State extends object ? WithUpdateReaction<State> : {}) &
  WithNoopReaction<State>;

export type InitializedSmartStore<
  State,
  S extends Selectors<State> = {},
  R extends ReactionsWithSelectors<State, S> = {},
> = SmartStore<State, ({} extends S ? {} : S) & WithGetState<State>> &
  SyntheticSources<InitializedReactions<State, S, R>>;

export type AdaptOptions<
  State,
  S extends Selectors<State> = {},
  R extends ReactionsWithSelectors<State, S> = {},
> = {
  path?: string;
  adapter?: R & { selectors?: S };
  sources?: SourceArg<State, S, R>;
};

export function isAdaptOptions<
  State,
  S extends Selectors<State> = {},
  R extends ReactionsWithSelectors<State, S> = {},
>(
  options: AdaptOptions<State, S, R> | undefined | R,
): options is AdaptOptions<State, S, R> {
  return ['path', 'adapter', 'sources'].some(key => key in (options || {}));
}

export type NotAdaptOptions = { path?: never; adapter?: never; sources?: never };
