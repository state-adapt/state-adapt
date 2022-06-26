import { actionSanitizer } from './action-sanitizer.function';
import { provideStore } from './provide-store.function';
import { stateSanitizer } from './state-sanitizer.function';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

export const defaultStoreProvider = provideStore(enableReduxDevTools);
