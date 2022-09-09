import { AdaptCommon, createStore } from '@state-adapt/rxjs';

// Angular provider
export function provideStore(enableReduxDevTools: any) {
  return { provide: AdaptCommon, useValue: createStore(enableReduxDevTools) };
}
