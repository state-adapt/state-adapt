import { Adapt, createStore } from '@state-adapt/rxjs';

// Angular provider
export function provideStore(enableReduxDevTools: any) {
  return { provide: Adapt, useValue: createStore(enableReduxDevTools) };
}
