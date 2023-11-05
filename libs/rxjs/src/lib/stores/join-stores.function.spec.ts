import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
import { configureStateAdapt } from '../global-store/configure-state-adapt.function';
import { joinStores } from './join-stores.function';
import { StateAdapt } from '../global-store/state-adapt';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});
const stateAdapt = configureStateAdapt({ devtools: enableReduxDevTools });
const { adapt, watch } = stateAdapt;

describe('joinStores', () => {
  const store1 = adapt(1);
  const store2 = adapt(2);
  it('should evaluate combined selectors', () => {
    const joinedStore = joinStores({ store1, store2 })({
      sum: s => s.store1 + s.store2,
    })();
    let sum;
    joinedStore.sum$.subscribe(s => (sum = s));
    expect(sum).toBe(3);
  });
  it('should return combined state', () => {
    const joinedStore = joinStores({ store1, store2 })();
    let state;
    joinedStore.state$.subscribe(s => {
      state = s;
      s.store1; // Errors if not typed correctly
    });
    expect(state).toEqual({ store1: 1, store2: 2 });
  });
  // TODO: Test memoization
  // TODO: Throw error if source is `.next` without subscribers
});
