import { act, renderHook } from '@testing-library/react';
import { BehaviorSubject } from 'rxjs';
import { useObservable } from './use-observable';

describe('useObservable', () => {
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
