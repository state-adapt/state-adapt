import { AdaptCommon } from './adapt';
import { createStore } from './create-store.function';

// Angular provider
export function provideStore(enableReduxDevTools: any) {
  return { provide: AdaptCommon, useValue: createStore(enableReduxDevTools) };
}
