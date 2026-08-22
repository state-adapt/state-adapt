import { act, renderHook } from '@testing-library/react';
import { adapt } from './adapt.function';
import { derive } from './derived';
import { useDerived } from './use-derived';
import { useStore } from './use-store';

const GET_SNAPSHOT_WARNING = 'getSnapshot should be cached';

const trackConsoleErrors = () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  return {
    getSnapshotWarnings: () =>
      spy.mock.calls.filter(call => String(call[0]).includes(GET_SNAPSHOT_WARNING)),
    restore: () => spy.mockRestore(),
  };
};

// An initial state factory reruns on every read while its store is inactive, so
// each read of a non-primitive returns a new value. React requires the reads it
// makes during one render to be identity-stable.
describe('rendering a store with an initial state factory', () => {
  it('does not reread the factory for every useStore render read', () => {
    const consoleErrors = trackConsoleErrors();
    let factoryCalls = 0;
    const store = adapt(() => {
      factoryCalls++;
      return { count: 1 };
    });

    const { result, unmount } = renderHook(() => useStore(store));

    expect(result.current[0].state).toEqual({ count: 1 });
    // One read for the render before activation, one for the activation itself.
    // React's repeated reads of the same render reuse the first one.
    expect(factoryCalls).toBe(2);
    expect(consoleErrors.getSnapshotWarnings()).toEqual([]);

    unmount();
    consoleErrors.restore();
  });

  it('does not reread the factory for every useDerived render read', () => {
    const consoleErrors = trackConsoleErrors();
    let factoryCalls = 0;
    const store = adapt(() => {
      factoryCalls++;
      return { count: 1 };
    });
    const shape = derive(() => store());

    const { result, unmount } = renderHook(() => useDerived(shape));

    expect(result.current).toEqual({ count: 1 });
    // Reads before activation: the projector's dependency discovery, its first
    // computation and the refresh that subscribes, plus the activation itself.
    // React's repeated reads of the same render reuse the first snapshot.
    expect(factoryCalls).toBe(4);
    expect(consoleErrors.getSnapshotWarnings()).toEqual([]);

    unmount();
    consoleErrors.restore();
  });

  it('renders the state the store activated with', () => {
    let nextCount = 1;
    const store = adapt(() => ({ count: nextCount }), {});

    const first = renderHook(() => useStore(store));
    expect(first.result.current[0].state).toEqual({ count: 1 });

    // The store deactivates, so the next activation reruns the factory.
    first.unmount();
    nextCount = 2;

    const second = renderHook(() => useStore(store));
    expect(second.result.current[0].state).toEqual({ count: 2 });

    act(() => second.result.current[1].update({ count: 3 }));
    expect(second.result.current[0].state).toEqual({ count: 3 });

    act(() => second.result.current[1].reset());
    // Reset returns to the state this activation started from.
    expect(second.result.current[0].state).toEqual({ count: 2 });

    second.unmount();
  });

  it('keeps reads outside of React up to the moment', () => {
    let factoryCalls = 0;
    const store = adapt(() => {
      factoryCalls++;
      return { count: 1 };
    });
    const shape = derive(() => store());

    // Nothing here is subscribed, so every read is an independent read.
    const firstRead = store.state();
    const secondRead = store.state();

    expect(firstRead).toEqual({ count: 1 });
    expect(secondRead).toEqual({ count: 1 });
    expect(firstRead).not.toBe(secondRead);
    expect(factoryCalls).toBe(2);

    expect(shape()).toEqual({ count: 1 });
    expect(factoryCalls).toBe(3);
  });
});
