import { act, renderHook } from '@testing-library/react';
import { configureStateAdapt, joinStores } from '@state-adapt/rxjs';
import { useStore } from './use-store';
import { take } from 'rxjs/operators';
import { AdaptContext } from './adapt.context';

const stateAdapt = configureStateAdapt({ devtools: null });
const { adapt } = stateAdapt;
const store1 = adapt('initial1');
const store2 = adapt('initial2');
const store3 = adapt('initial3');

const joined12Store = joinStores({ name1: store1, name2: store2 })({
  name1name2: s => s.name1 + s.name2,
})();

const joined123Store = joinStores({ name12: joined12Store, name3: store3 })({
  name12name3: s => s.name12Name1name2 + s.name3,
})();

const wrapper = ({ children }: any) => (
  <AdaptContext.Provider value={stateAdapt}>{children}</AdaptContext.Provider>
);

describe('useStore', () => {
  it('should return correct combined selector initial and after subscription results from joined12Store', () => {
    const joined12Results: string[] = [];
    const { result } = renderHook(
      () => {
        const joined12 = useStore(joined12Store);
        joined12Results.push(joined12.name1name2);
        return joined12;
      },
      { wrapper },
    );
    expect(joined12Results).toEqual(['initial1initial2', 'initial1initial2']);
  });

  it('should return correct combined selector initial and after subscription results from joined123Store', () => {
    const joined123Results: string[] = [];
    const { result } = renderHook(
      () => {
        const joined123 = useStore(joined123Store);
        joined123Results.push(joined123.name12name3);
        return joined123;
      },
      { wrapper },
    );
    expect(joined123Results).toEqual([
      'initial1initial2initial3',
      'initial1initial2initial3',
    ]);
  });

  it('should return correct combined selector result from joined123Store after store1 change', () => {
    const joined123Results: string[] = [];
    const { result } = renderHook(
      () => {
        const joined123 = useStore(joined123Store);
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
      'initial1initial2initial3',
      'new1initial2initial3',
    ]);
  });

  it('should return correct selector results while using both selector and fullSelector', () => {
    const joined123Results: string[] = [];
    const joined123FullSelectorResults: string[] = [];
    const { result } = renderHook(
      () => {
        const joined123 = useStore(joined123Store);
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
      'initial1initial2initial3',
      'new1initial2initial3',
    ]);
    expect(joined123FullSelectorResults).toEqual([
      'initial1initial2initial3',
      'initial1initial2initial3',
      'new1initial2initial3',
    ]);
  });

  it('should have TS error when selector not in filter selectors list is used', () => {
    const checkTypes = () => {
      const { result } = renderHook(
        () => {
          const joined123 = useStore(joined123Store, ['name3']);
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
        const { name3 } = useStore(joined123Store, ['name3']);
        name3Results.push(name3);
        return name3;
      },
      { wrapper },
    );
    expect(name3Results).toEqual(['initial3', 'initial3']);
    act(() => {
      store1.set('new1');
    });
    expect(name3Results).toEqual(['initial3', 'initial3']);
    act(() => {
      store2.set('new2');
    });
    expect(name3Results).toEqual(['initial3', 'initial3']);
    act(() => {
      store3.set('new3');
    });
    expect(name3Results).toEqual(['initial3', 'initial3', 'new3']);
  });

  it('should use global state if another store has already been initialized', () => {
    const results: string[] = [];
    const { result } = renderHook(
      () => {
        const { name3 } = useStore(joined123Store, ['name3']);
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
        const { name3 } = useStore(joined123Store, ['name3']);
        results.push(name3);
        return name3;
      },
      { wrapper },
    );
    expect(result2.current).toEqual('new3');
    expect(results).toEqual(['initial3', 'initial3', 'new3', 'new3', 'new3']);
  });
});
