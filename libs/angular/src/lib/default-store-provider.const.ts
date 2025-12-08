import { configureStateAdapt } from '@state-adapt/rxjs';
import { StateAdaptToken } from './state-adapt-token.const';

/**
  @deprecated No longer required. StateAdapt now maintains a default provider internally.

  Use {@link provideStore} for more advanced configuration.
 */
export const defaultStoreProvider = {
  provide: StateAdaptToken,
  useFactory: () => configureStateAdapt() as any,
};
