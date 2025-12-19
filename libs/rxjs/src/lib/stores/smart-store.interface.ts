import { Selectors } from '@state-adapt/core';
import { Selections } from '../stores/selections.type';
import { CoreStoreProps } from './core-store-props.type';

export type SmartStore<State, S extends Selectors<State>> = Selections<State, S> & {
  /**
   * Don't use this property directly. Intended for internal use only.
   */
  __: CoreStoreProps<State, S> & {
    path: string;
  };
};
