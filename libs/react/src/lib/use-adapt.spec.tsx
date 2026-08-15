import { act, renderHook } from '@testing-library/react';
import { configureStateAdapt } from '@state-adapt/rxjs';
import { AdaptContext } from './adapt.context';
import { useAdapt } from './use-adapt';
import { useStore } from './use-store';

const stateAdapt = configureStateAdapt({ devtools: null });

const wrapper = ({ children }: any) => (
  <AdaptContext.Provider value={stateAdapt}>{children}</AdaptContext.Provider>
);

describe('useAdapt with an initial state factory', () => {
  it('should use the state returned by the factory', () => {
    const { result } = renderHook(
      () =>
        useAdapt(() => 'John', {
          concat: (state: string, payload: string) => state + payload,
          selectors: {
            length: (state: string) => state.length,
          },
        }),
      { wrapper },
    );

    const [name] = result.current;
    expect(name.state).toBe('John');
    expect(name.length).toBe(4);
  });

  it('should not call the factory again for re-renders or state changes', () => {
    let calls = 0;
    const { result, rerender } = renderHook(
      () =>
        useAdapt(() => {
          calls++;
          return 'John';
        }),
      { wrapper },
    );

    // Mounting reads the inactive store while rendering, then activates it
    const callsAfterMount = calls;
    expect(result.current[0].state).toBe('John');

    rerender();
    rerender();
    expect(calls).toBe(callsAfterMount);

    act(() => {
      result.current[1]('Johnsh');
    });
    expect(result.current[0].state).toBe('Johnsh');
    expect(calls).toBe(callsAfterMount);
  });

  it('should reset to the state the factory returned', () => {
    const { result } = renderHook(() => useAdapt(() => ({ a: 5, b: 5 })), { wrapper });

    expect(result.current[0].state).toEqual({ a: 5, b: 5 });

    act(() => {
      result.current[1].update({ b: 10 });
    });
    expect(result.current[0].state).toEqual({ a: 5, b: 10 });

    act(() => {
      result.current[1].reset();
    });
    expect(result.current[0].state).toEqual({ a: 5, b: 5 });
  });

  it('should call the factory again when a shared store remounts', () => {
    let name = 'John';
    const store = stateAdapt.adapt(() => name);

    const { result: result1, unmount } = renderHook(() => useStore(store), { wrapper });
    expect(result1.current[0].state).toBe('John');

    // Last consumer goes away, so the store deactivates
    unmount();
    name = 'Jane';

    const { result: result2 } = renderHook(() => useStore(store), { wrapper });
    expect(result2.current[0].state).toBe('Jane');

    act(() => {
      result2.current[1]('Janesh');
    });
    expect(result2.current[0].state).toBe('Janesh');

    act(() => {
      result2.current[1].reset();
    });
    // The state this activation started from, not the one the first mount started from
    expect(result2.current[0].state).toBe('Jane');
  });
});
