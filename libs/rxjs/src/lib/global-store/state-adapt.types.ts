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
  readonly value: any;
  select: (sel: any) => Observable<any>;
  dispatch: (action: any) => any;
}

/**
  A store's initial state, either as a plain value or as a factory function that returns it.

  A factory runs once per activation: the store calls it when it activates, holds onto that
  value for as long as it stays active, and discards it when it deactivates. So a store that
  is reset always goes back to what its *current* activation started from.
  Reading state from an inactive store calls the factory for that read alone.

  ```typescript
  const name = adapt(() => localStorage.getItem('name') ?? 'John');
  ```

  @hidden
 */
export type InitialState<State> = State | (() => State);

export type DefaultReactions<State> = BasicAdapterMethods<State> &
  (State extends object ? WithUpdateReaction<State> : unknown) &
  WithNoopReaction<State>;

type SourceObject<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
> = Sources<State, S, DefaultReactions<State>> & Sources<State, S, R>;

type ObservableSource<State> =
  | Observable<State>
  | Observable<State>[]
  | Observable<Action<State>>
  | Observable<Action<State>>[];

export type ConcreteSourceArg<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
> = SourceObject<State, S, R> | ObservableSource<State>;

// Extra callback keys become `never` so they fail assignability. Excess-property
// checks do not apply to a callback return when `sources` is a union.
type StrictSources<ReturnedSources, Allowed> = {
  [K in keyof ReturnedSources]?: K extends keyof Allowed ? Allowed[K] : never;
};

export type SourceArg<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
  ReturnedSources = unknown,
> =
  | ConcreteSourceArg<State, S, R>
  | ((
      detachedStore: SmartStore<State, S & WithGetState<State>>,
    ) =>
      | StrictSources<ReturnedSources, SourceObject<State, S, R>>
      | ObservableSource<State>);

export type InitializedReactions<
  State,
  // eslint-disable-next-line @typescript-eslint/ban-types -- Intentional empty generic default.
  S extends Selectors<State> = {},
  // eslint-disable-next-line @typescript-eslint/ban-types -- Intentional empty generic default.
  R extends ReactionsWithSelectors<State, S> = {},
  // eslint-disable-next-line @typescript-eslint/ban-types -- Literal `{}` preserves deferred inference and the empty branch.
> = ({} extends R ? {} : R) & DefaultReactions<State>;

export type InitializedSmartStore<
  State,
  // eslint-disable-next-line @typescript-eslint/ban-types -- Intentional empty generic default.
  S extends Selectors<State> = {},
  // eslint-disable-next-line @typescript-eslint/ban-types -- Intentional empty generic default.
  R extends ReactionsWithSelectors<State, S> = {},
  // eslint-disable-next-line @typescript-eslint/ban-types -- Literal `{}` preserves deferred inference and the empty branch.
> = SmartStore<State, ({} extends S ? {} : S) & WithGetState<State>> &
  SyntheticSources<InitializedReactions<State, S, R>>;

export interface AdaptOptions<
  State,
  // eslint-disable-next-line @typescript-eslint/ban-types -- Intentional empty generic default.
  S extends Selectors<State> = {},
  // eslint-disable-next-line @typescript-eslint/ban-types -- Intentional empty generic default.
  R extends ReactionsWithSelectors<State, S> = {},
  ReturnedSources = unknown,
> {
  path?: string;
  adapter?: R & { selectors?: S };
  sources?: SourceArg<State, S, R, ReturnedSources>;
}

export function isAdaptOptions<
  State,
  // eslint-disable-next-line @typescript-eslint/ban-types -- Intentional empty generic default.
  S extends Selectors<State> = {},
  // eslint-disable-next-line @typescript-eslint/ban-types -- Intentional empty generic default.
  R extends ReactionsWithSelectors<State, S> = {},
>(
  options: AdaptOptions<State, S, R> | undefined | R,
): options is AdaptOptions<State, S, R> {
  return ['path', 'adapter', 'sources'].some(key => key in (options || {}));
}

export type NotAdaptOptions = {
  path?: never;
  adapter?: never;
  sources?: never;
};
