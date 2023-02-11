import { Selectors } from '../selectors/selectors.interface';
import { Adapter, ReactionsWithSelectors } from './adapter.type';
import { Reaction } from './reaction.type';
import { Reactions } from './reactions.interface';

export interface AdapterBuilder<
  State,
  S extends Selectors<State>,
  R extends Reactions<State>,
> {
  selectors: S;
  reactions: R;
}

export type BuiltAdapter<
  State,
  R extends Reactions<State>,
  S extends Selectors<State>,
> = {
  [K in keyof R | 'selectors']: K extends 'selectors' ? S : R[K];
};

export type ReactionsWithoutSelectors<
  State,
  R extends ReactionsWithSelectors<State, any>,
> = {
  [K in keyof R]: K extends 'selectors'
    ? never
    : R[K] extends Reaction<State>
    ? R[K]
    : never;
};

export type ReactionsFromAdapter<A extends Adapter<any, any, any>> = {
  [K in keyof A]: A[K] extends Reaction<any> ? A[K] : never;
};
