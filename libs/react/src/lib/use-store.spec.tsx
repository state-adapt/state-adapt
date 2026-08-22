import { act, renderHook } from '@testing-library/react';
import { ReactNode, useLayoutEffect } from 'react';
import { configureStateAdapt, joinStores } from '@state-adapt/rxjs';
import { useStore } from './use-store';
import { STATE_ADAPT_CONTEXT_MISMATCH_ERROR } from './use-proxy-states';
import { take } from 'rxjs/operators';
import { AdaptContext } from './adapt.context';
import { adapt as defaultAdapt } from './adapt.function';
import { globalSelectorsCache, serializeSelectorsCache } from '@state-adapt/core';

const stateAdapt = configureStateAdapt({ devtools: null });
const { adapt } = stateAdapt;
const store1 = adapt('initial1', {
  reverseWith: (state: string, delim: string) => state.split('').reverse().join(delim),
});
const store2 = adapt('initial2');
const store3 = adapt('initial3');

const joined12Store = joinStores({ name1: store1, name2: store2 })({
  name1name2: s => s.name1 + s.name2,
})();

const joined123Store = joinStores({ name12: joined12Store, name3: store3 })({
  name12name3: s => s.name12Name1name2 + s.name3,
})({
  reverseName12name3: s => s.name12name3.split('').reverse().join(''),
})();

const wrapper = ({ children }: any) => (
  <AdaptContext.Provider value={stateAdapt}>{children}</AdaptContext.Provider>
);

describe('useStore proxy states', () => {
  it('should use the default context when no provider is present', () => {
    const store = defaultAdapt('initial');
    const { result } = renderHook(() => useStore(store));

    expect(result.current[0].state).toBe('initial');

    act(() => {
      result.current[1]('updated');
    });
    expect(result.current[0].state).toBe('updated');
  });

  it('should reject a store from a different StateAdapt instance', () => {
    const store = defaultAdapt('initial');
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useStore(store), { wrapper })).toThrow(
      STATE_ADAPT_CONTEXT_MISMATCH_ERROR,
    );
    consoleError.mockRestore();
  });

  it('should sync an update made between render and subscription', () => {
    const store = adapt('before');
    const results: string[] = [];
    const activation = store.state$.subscribe();

    const UpdateStore = () => {
      useLayoutEffect(() => {
        store.set('after');
      }, []);
      return null;
    };
    const updateBeforeSubscriptionWrapper = ({ children }: { children: ReactNode }) => (
      <AdaptContext.Provider value={stateAdapt}>
        <UpdateStore />
        {children}
      </AdaptContext.Provider>
    );

    const { unmount } = renderHook(
      () => {
        const [state] = useStore(store);
        results.push(state.state);
      },
      { wrapper: updateBeforeSubscriptionWrapper },
    );

    expect(results).toEqual(['before', 'after']);
    unmount();
    activation.unsubscribe();
  });

  it('should return the correct initial combined selector result from joined12Store', () => {
    const joined12Results: string[] = [];
    const { result } = renderHook(
      () => {
        const [joined12] = useStore(joined12Store);
        joined12Results.push(joined12.name1name2);
        return [joined12];
      },
      { wrapper },
    );
    expect(joined12Results).toEqual(['initial1initial2']);
  });

  it('should return the correct initial combined selector result from joined123Store', () => {
    const joined123Results: string[] = [];
    const { result } = renderHook(
      () => {
        const [joined123] = useStore(joined123Store);
        joined123Results.push(joined123.name12name3);
        return joined123;
      },
      { wrapper },
    );
    expect(joined123Results).toEqual(['initial1initial2initial3']);
  });

  it('should return correct combined selector result from joined123Store after store1 change', () => {
    const joined123Results: string[] = [];
    const { result } = renderHook(
      () => {
        const [joined123] = useStore(joined123Store);
        joined123Results.push(joined123.name12name3);
        return joined123;
      },
      { wrapper },
    );
    act(() => {
      store1.set('new1');
    });
    expect(joined123Results).toEqual([
      'initial1initial2initial3',
      'new1initial2initial3',
    ]);
  });

  it('should return correct selector results while using both selector and fullSelector', () => {
    const joined123Results: string[] = [];
    const joined123FullSelectorResults: string[] = [];
    const { result } = renderHook(
      () => {
        const [joined123] = useStore(joined123Store);
        joined123Results.push(joined123.name12name3);
        joined123Store.name12name3$
          .pipe(take(1))
          .subscribe(v => joined123FullSelectorResults.push(v));
        return joined123;
      },
      { wrapper },
    );
    act(() => {
      store1.set('new1');
    });
    expect(joined123Results).toEqual([
      'initial1initial2initial3',
      'new1initial2initial3',
    ]);
    expect(joined123FullSelectorResults).toEqual([
      'initial1initial2initial3',
      'new1initial2initial3',
    ]);
  });

  it('should have TS error when selector not in filter selectors list is used', () => {
    const checkTypes = () => {
      const { result } = renderHook(
        () => {
          const [joined123] = useStore(joined123Store, ['name3']);
          // @ts-expect-error Should only be able to use selectors in filterSelectors
          return joined123.name12Name1name2;
        },
        { wrapper },
      );
    };
    expect(true).toEqual(true);
  });

  it('should only rerender when filter selectors emit', () => {
    const name3Results: string[] = [];
    const { result } = renderHook(
      () => {
        const [{ name3 }] = useStore(joined123Store, ['name3']);
        name3Results.push(name3);
        return name3;
      },
      { wrapper },
    );
    expect(name3Results).toEqual(['initial3']);
    act(() => {
      store1.set('new1');
    });
    expect(name3Results).toEqual(['initial3']);
    act(() => {
      store2.set('new2');
    });
    expect(name3Results).toEqual(['initial3']);
    act(() => {
      store3.set('new3');
    });
    expect(name3Results).toEqual(['initial3', 'new3']);
  });

  it('should use global state if another store has already been initialized', () => {
    const results: string[] = [];
    const { result } = renderHook(
      () => {
        const [{ name3 }] = useStore(joined123Store, ['name3']);
        results.push(name3);
        return name3;
      },
      { wrapper },
    );
    expect(result.current).toEqual('initial3');
    act(() => {
      store3.set('new3');
    });

    const { result: result2 } = renderHook(
      () => {
        const [{ name3 }] = useStore(joined123Store, ['name3']);
        results.push(name3);
        return name3;
      },
      { wrapper },
    );
    expect(result2.current).toEqual('new3');
    expect(results).toEqual(['initial3', 'new3', 'new3']);
  });

  // reverseName12name3
  it('should return correct combined selector result from joined123Store and not create infinite loop when globalSelectorsCache serialized', () => {
    const joined123Results: string[] = [];
    const { result } = renderHook(
      () => {
        const [joined123] = useStore(joined123Store);
        joined123Results.push(joined123.reverseName12name3);
        return joined123;
      },
      { wrapper },
    );
    serializeSelectorsCache(globalSelectorsCache);
    expect(joined123Results).toEqual(['3laitini2laitini1laitini']);
  });
});

describe('useStore setState/store', () => {
  it('should set state', () => {
    const store1Results: string[] = [];
    let setState1: any;
    let reverse1: any;
    const { result } = renderHook(
      () => {
        const [state1, setState] = useStore(store1);
        store1Results.push(state1.state);
        setState1 = setState;
        reverse1 = setState.reverseWith;
        const typeTest = () => {
          // @ts-expect-error Should only accept string
          setState(2);
          setState.reset();
        };
      },
      { wrapper },
    );
    expect(store1Results).toEqual(['initial1']);
    act(() => {
      setState1('asdf');
    });
    expect(store1Results).toEqual(['initial1', 'asdf']);
    act(() => {
      reverse1('-');
    });
    expect(store1Results).toEqual(['initial1', 'asdf', 'f-d-s-a']);
  });
});
