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
  it('should evaluate combined selectors', () => {
    const store1 = adapt(1);
    const store2 = adapt(2);
    const joinedStore = joinStores({ store1, store2 })({
      sum: s => s.store1 + s.store2,
    })();
    let sum;
    joinedStore.sum$.subscribe(s => (sum = s));
    expect(sum).toBe(3);
  });
});
