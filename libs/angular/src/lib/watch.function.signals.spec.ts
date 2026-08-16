import { TestBed } from '@angular/core/testing';
import { getId } from '@state-adapt/core';
import { adapt } from './adapt.function';
import { watch } from './watch.function';

describe('watch signals', () => {
  it('mirrors watched state without activating the store', () => {
    TestBed.configureTestingModule({});
    TestBed.runInInjectionContext(() => {
      const path = `watch.signal.${getId()}`;
      const watched = watch<number>(path);
      const count = adapt(1, { path });

      expect(watched()).toBeUndefined();

      const subscription = count.state$.subscribe();
      expect(watched()).toBe(1);

      count.set(2);
      expect(watched()).toBe(2);

      subscription.unsubscribe();
    });
  });

  it('adds signals for adapter selectors', () => {
    TestBed.configureTestingModule({});
    TestBed.runInInjectionContext(() => {
      const path = `watch.selector.signal.${getId()}`;
      const adapter = {
        set: (state: number, value: number) => value,
        reset: (state: number, payload: void, initialState: number) => initialState,
        selectors: {
          double: (state: number) => state * 2,
        },
      };
      const watched = watch(path, adapter);
      const count = adapt(1, { adapter, path });

      expect(watched.double()).toBeUndefined();

      const subscription = count.state$.subscribe();
      expect(watched.double()).toBe(2);

      count.set(3);
      expect(watched.double()).toBe(6);

      subscription.unsubscribe();
    });
  });
});
