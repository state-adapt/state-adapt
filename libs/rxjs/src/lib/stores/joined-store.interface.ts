import { AnySelectors } from '@state-adapt/core';
import { Selections } from '../stores/selections.type';
import { WithCoreStoreProps } from './core-store-props.type';

export type JoinedStore<State, S extends AnySelectors> = Selections<State, S> &
  WithCoreStoreProps<State, S>;
