import { act, renderHook } from '@testing-library/react';
import { configureStateAdapt, joinStores } from '@state-adapt/rxjs';
import { useStore } from './use-store';
import { take } from 'rxjs/operators';

const { adapt } = configureStateAdapt({ devtools: null });
const store1 = adapt('name1', 'initial1');
const store2 = adapt('name2', 'initial2');
const store3 = adapt('name3', 'initial3');

const joined12Store = joinStores({ name1: store1, name2: store2 })({
  name1name2: s => s.name1 + s.name2,
})();

const joined123Store = joinStores({ name12: joined12Store, name3: store3 })({
  name12name3: s => s.name12Name1name2 + s.name3,
})();

describe('useStore', () => {
  it('should return correct combined selector initial and after subscription results from joined12Store', () => {
    const joined12Results: string[] = [];
    const { result } = renderHook(() => {
      const joined12 = useStore(joined12Store);
      joined12Results.push(joined12.name1name2);
      return joined12;
    });
    expect(joined12Results).toEqual(['initial1initial2', 'initial1initial2']);
  });

  it('should return correct combined selector initial and after subscription results from joined123Store', () => {
    const joined123Results: string[] = [];
    const { result } = renderHook(() => {
      const joined123 = useStore(joined123Store);
      joined123Results.push(joined123.name12name3);
      return joined123;
    });
    expect(joined123Results).toEqual([
      'initial1initial2initial3',
      'initial1initial2initial3',
    ]);
  });

  it('should return correct combined selector result from joined123Store after store1 change', () => {
    const joined123Results: string[] = [];
    const { result } = renderHook(() => {
      const joined123 = useStore(joined123Store);
      joined123Results.push(joined123.name12name3);
      return joined123;
    });
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
    const { result } = renderHook(() => {
      const joined123 = useStore(joined123Store);
      joined123Results.push(joined123.name12name3);
      joined123Store.name12name3$
        .pipe(take(1))
        .subscribe(v => joined123FullSelectorResults.push(v));
      return joined123;
    });
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
});
