import { AnySelectors } from '@state-adapt/core';
import { Observable } from 'rxjs';

export type CoreStoreProps<State, S extends AnySelectors> = {
  requireSources$: Observable<any>;
  fullSelectors: S;
  selectors: S;
  initialState: State;
  getCurrentState: () => State;
  select: <State>(sel: any) => Observable<State>;
};

export type WithCoreStoreProps<State, S extends AnySelectors> = {
  /**
   * Don't use this property directly. Intended for internal use only.
   */
  __: CoreStoreProps<State, S>;
};
