import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
import { provideStore } from './provide-store.function';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

export const defaultStoreProvider = provideStore(enableReduxDevTools);
