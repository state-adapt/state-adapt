import { act, renderHook } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { useObservable } from './use-observable';

describe('useObservable', () => {
  it('should infer the return type from the initial value', () => {
    const value$ = new BehaviorSubject<number>(0);
    const optionalValue$ = new BehaviorSubject<number | undefined>(undefined);

    renderHook(() => {
      const valueWithoutInitial = useObservable(value$);
      const valueWithInitial = useObservable(value$, 0);
      const optionalValueWithInitial = useObservable(optionalValue$, 0);

      const optionalValue: number | undefined = valueWithoutInitial;
      const value: number = valueWithInitial;
      const stillOptionalValue: number | undefined = optionalValueWithInitial;

      // @ts-expect-error An observable without an initial value may return undefined.
      const missingInitialValue: number = valueWithoutInitial;
      // @ts-expect-error The observable itself may emit undefined.
      const emittedUndefined: number = optionalValueWithInitial;
      // @ts-expect-error The initial value must match the observable's value type.
      useObservable(value$, '0');

      return { optionalValue, value, stillOptionalValue, missingInitialValue, emittedUndefined };
    });
  });

  it('should return the latest value without an initial value', () => {
    const value$ = new BehaviorSubject('initial');
    const { result } = renderHook(() => useObservable(value$));

    expect(result.current).toBe('initial');
  });

  it('should use an initial value during the first render', () => {
    const value$ = new BehaviorSubject('initial');
    const results: string[] = [];

    renderHook(() => {
      results.push(useObservable(value$, 'initial'));
    });

    expect(results).toEqual(['initial']);
  });

  it('should render when the observable value changes', () => {
    const value$ = new BehaviorSubject('initial');
    const { result } = renderHook(() => useObservable(value$, 'initial'));

    act(() => value$.next('next'));

    expect(result.current).toBe('next');
  });

  it('should not render when the observable emits the current value', () => {
    const value$ = new BehaviorSubject('initial');
    const results: string[] = [];

    renderHook(() => {
      results.push(useObservable(value$, 'initial'));
    });
    act(() => value$.next('initial'));

    expect(results).toEqual(['initial']);
  });
});
