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

export type ConcreteSourceArg<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
> =
  | Sources<State, S, DefaultReactions<State> & R>
  | Observable<State>
  | Observable<State>[]
  | Observable<Action<State>>
  | Observable<Action<State>>[];

export type SourceArg<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
> =
  | ConcreteSourceArg<State, S, R>
  | ((
      detachedStore: SmartStore<State, S & WithGetState<State>>,
    ) => ConcreteSourceArg<State, S, R>);
// ) => {[K in keyof ConcreteSourceArg<State, S, R> as K extends keyof R ? K : never]: ConcreteSourceArg<State, S, R>[K]});

// See https://github.com/state-adapt/state-adapt/issues/67
// and https://stackblitz.com/edit/state-adapt-angular-38pewt?file=src%2Fapp%2Fcounter.component.ts
// type Obj = {
//   asdf: string;
//   qwer: number;
// };
// type Obj2<O extends Obj> = { [index: string]: never } & {
//   [K in keyof O]: O[K];
// };
// function doThing<T extends Obj, O extends Obj2<T>, GetObj extends () => Obj2<T>>(
//   obj: T,
//   getObj: ) | GetObj,
//   // getObj: GetObj,
// ) {
//   return getObj();
// }
// doThing({ asdf: 'asdf', qwer: 1234, b: 'b' },
//   () => ({
//   // ({
//   asdf: 'asdf', // This does not error, as expected
//   qwer: 1234, // This does not error, as expected
//   b: 'b', // TODO: Make this okay; thinks type needs to be `never`
//   // @ts-expect-error Extra properties are unwanted
//   1234: 'asdf', // This errors, as expected
// }));

export type DefaultReactions<State> = BasicAdapterMethods<State> &
  (State extends object ? WithUpdateReaction<State> : {}) &
  WithNoopReaction<State>;

export type InitializedReactions<
  State,
  S extends Selectors<State> = {},
  R extends ReactionsWithSelectors<State, S> = {},
> = ({} extends R ? {} : R) & DefaultReactions<State>;

export type InitializedSmartStore<
  State,
  S extends Selectors<State> = {},
  R extends ReactionsWithSelectors<State, S> = {},
> = SmartStore<State, ({} extends S ? {} : S) & WithGetState<State>> &
  SyntheticSources<InitializedReactions<State, S, R>>;

export interface AdaptOptions<
  State,
  S extends Selectors<State> = {},
  R extends ReactionsWithSelectors<State, S> = {},
  // ActualSourceArg extends SourceArg<State, S, R> = SourceArg<State, S, R>,
> {
  path?: string;
  adapter?: R & { selectors?: S };
  sources?: SourceArg<State, S, R>;
  // sources?: ActualSourceArg;
  // sources?: ActualSourceArg extends ((
  //     detachedStore: SmartStore<State, S & WithGetState<State>>,
  //   ) => ConcreteSourceArg<State, S, R>)
  //   ? true
  //   // ? { [K in keyof ActualSourceArg as K extends keyof R ? never : K]?: ActualSourceArg[K] }
  //   : SourceArg<State, S, R>;
}

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
