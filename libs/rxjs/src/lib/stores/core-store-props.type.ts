import { AnySelectors } from '@state-adapt/core';
import { Observable } from 'rxjs';

export type CoreStoreProps<State, S extends AnySelectors> = {
  stateAdaptInstanceId: symbol;
  requireSources$: Observable<any>;
  fullSelectors: S;
  selectors: S;
  initialState: State;
  getCurrentState: () => State;
  getGlobalState: () => any;
  isActive: () => boolean;
  select: <State>(sel: any) => Observable<State>;
};

export type WithCoreStoreProps<State, S extends AnySelectors> = {
  /**
   * @private Don't use this property directly. Intended for internal use only.
   */
  __: CoreStoreProps<State, S>;
};
