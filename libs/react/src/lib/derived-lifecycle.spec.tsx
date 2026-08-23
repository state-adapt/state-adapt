import { act, render, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { createAdapter, getId } from '@state-adapt/core';
import { Observable, of } from 'rxjs';
import { adapt } from './adapt.function';
import { derive } from './derive.function';
import { useDerived } from './use-derived';
import { useStore } from './use-store';
import { watch } from './watch.function';

const path = (name: string) => `${name}.${getId()}`;

const trackedSource = <State = number,>() => {
  let subscriptions = 0;
  let activations = 0;
  const source$ = new Observable<State>(() => {
    subscriptions++;
    activations++;
    return () => subscriptions--;
  });
  return {
    source$,
    active: () => subscriptions,
    activations: () => activations,
  };
};

describe('derive store activation', () => {
  it('activates nested derivation store dependencies', () => {
    const countSource = trackedSource();
    const factorSource = trackedSource();
    const count = adapt(2, { sources: countSource.source$ });
    const factor = adapt(3, { sources: factorSource.source$ });
    const product = derive(() => count() * factor());
    const label = derive(() => `Value: ${product()}`);

    const { result, unmount } = renderHook(() => useDerived(label));

    expect(result.current).toBe('Value: 6');
    expect(countSource.active()).toBe(1);
    expect(factorSource.active()).toBe(1);

    act(() => factor.set(4));
    expect(result.current).toBe('Value: 8');

    unmount();
    expect(countSource.active()).toBe(0);
    expect(factorSource.active()).toBe(0);
  });

  it('switches conditional store activation after every dependency cycle', () => {
    const modeSource = trackedSource<'first' | 'second'>();
    const firstSource = trackedSource();
    const secondSource = trackedSource();
    const mode = adapt('first', { sources: modeSource.source$ });
    const first = adapt(1, { sources: firstSource.source$ });
    const second = adapt(1, { sources: secondSource.source$ });
    const selected = derive(() => (mode() === 'first' ? first() : second()));

    const { result, unmount } = renderHook(() => useDerived(selected));

    expect(result.current).toBe(1);
    expect(modeSource.active()).toBe(1);
    expect(firstSource.active()).toBe(1);
    expect(secondSource.active()).toBe(0);

    act(() => mode.set('second'));

    // The selected value stays equal, but the active store dependency still changes.
    expect(result.current).toBe(1);
    expect(modeSource.active()).toBe(1);
    expect(firstSource.active()).toBe(0);
    expect(secondSource.active()).toBe(1);

    act(() => second.set(3));
    expect(result.current).toBe(3);

    unmount();
    expect(modeSource.active()).toBe(0);
    expect(firstSource.active()).toBe(0);
    expect(secondSource.active()).toBe(0);
  });

  it('uses callable watched selectors without activating the watched store', () => {
    const countSource = trackedSource();
    const countPath = path('watched');
    const adapter = createAdapter<number>()({
      selectors: {
        double: (state: number) => state * 2,
      },
    });
    const count = adapt(2, {
      adapter,
      sources: countSource.source$,
      path: countPath,
    });
    const watchedCount = watch(countPath, adapter);
    const double = derive(() => watchedCount.double());

    expect(watchedCount()).toBeUndefined();
    expect(watchedCount.double()).toBeUndefined();

    const derived = renderHook(() => useDerived(double));
    expect(derived.result.current).toBeUndefined();
    expect(countSource.active()).toBe(0);

    let activation: { unsubscribe: () => void } = {
      unsubscribe: () => undefined,
    };
    act(() => {
      activation = count.state$.subscribe();
    });

    expect(countSource.active()).toBe(1);
    expect(derived.result.current).toBe(4);

    act(() => count.set(3));
    expect(derived.result.current).toBe(6);

    activation.unsubscribe();
    derived.unmount();
    expect(countSource.active()).toBe(0);
  });
});

describe('derive store activation across consumers', () => {
  it('keeps a store active until the last consumer of one derived unmounts', () => {
    const countSource = trackedSource();
    const count = adapt(1, { sources: countSource.source$ });
    const double = derive(() => count() * 2);

    const first = renderHook(() => useDerived(double));
    const second = renderHook(() => useDerived(double));

    expect(first.result.current).toBe(2);
    expect(second.result.current).toBe(2);
    expect(countSource.active()).toBe(1);

    first.unmount();

    // `second` still consumes the store, so it must stay active and keep emitting.
    expect(countSource.active()).toBe(1);
    act(() => count.set(5));
    expect(second.result.current).toBe(10);

    second.unmount();
    expect(countSource.active()).toBe(0);
  });

  it('keeps a store active until the last derived using it unmounts', () => {
    const countSource = trackedSource();
    const count = adapt(1, { sources: countSource.source$ });
    const incremented = derive(() => count() + 1);
    const doubled = derive(() => count() * 2);

    const first = renderHook(() => useDerived(incremented));
    const second = renderHook(() => useDerived(doubled));

    expect(countSource.active()).toBe(1);

    first.unmount();

    // A different derived still depends on the same store.
    expect(countSource.active()).toBe(1);
    act(() => count.set(5));
    expect(second.result.current).toBe(10);

    second.unmount();
    expect(countSource.active()).toBe(0);
  });

  it('keeps a store active while either useStore or useDerived consumes it', () => {
    const countSource = trackedSource();
    const count = adapt(1, { sources: countSource.source$ });
    const doubled = derive(() => count() * 2);

    const viaStore = renderHook(() => useStore(count));
    const viaDerived = renderHook(() => useDerived(doubled));

    expect(viaStore.result.current[0].state).toBe(1);
    expect(viaDerived.result.current).toBe(2);
    expect(countSource.active()).toBe(1);

    viaDerived.unmount();

    expect(countSource.active()).toBe(1);
    act(() => count.set(3));
    expect(viaStore.result.current[0].state).toBe(3);

    viaStore.unmount();
    expect(countSource.active()).toBe(0);
  });

  it('reactivates store dependencies after the last consumer unmounts', () => {
    const countSource = trackedSource();
    let initialCount = 1;
    const count = adapt(() => initialCount, { sources: countSource.source$ });
    const doubled = derive(() => count() * 2);

    const first = renderHook(() => useDerived(doubled));
    expect(first.result.current).toBe(2);
    expect(countSource.activations()).toBe(1);

    first.unmount();
    expect(countSource.active()).toBe(0);

    initialCount = 10;
    const second = renderHook(() => useDerived(doubled));

    // The store reactivates and the derivation recalculates from the new
    // initial state instead of replaying the memoized value.
    expect(countSource.activations()).toBe(2);
    expect(countSource.active()).toBe(1);
    expect(second.result.current).toBe(20);

    act(() => count.set(6));
    expect(second.result.current).toBe(12);

    second.unmount();
    expect(countSource.active()).toBe(0);
  });

  it('activates store dependencies once through a StrictMode double-mount', () => {
    const countSource = trackedSource();
    const count = adapt(1, { sources: countSource.source$ });
    const doubled = derive(() => count() * 2);
    const values: number[] = [];

    const Doubled = () => {
      values.push(useDerived(doubled));
      return null;
    };

    const { unmount } = render(
      <StrictMode>
        <Doubled />
      </StrictMode>,
    );

    expect(countSource.active()).toBe(1);
    expect(values[values.length - 1]).toBe(2);

    act(() => count.set(4));
    expect(values[values.length - 1]).toBe(8);

    unmount();
    expect(countSource.active()).toBe(0);
  });

  it('reconciles dependencies that change while a store activates', () => {
    const firstSource = trackedSource();
    const secondSource = trackedSource();
    // Emits as soon as the store activates, so the dependency the projector
    // picks changes midway through the pass that subscribes to it.
    const useSecond = adapt(false, { sources: { set: of(true) } });
    const first = adapt(1, { sources: firstSource.source$ });
    const second = adapt(2, { sources: secondSource.source$ });
    const selected = derive(() => (useSecond() ? second() : first()));

    const { result, unmount } = renderHook(() => useDerived(selected));

    expect(result.current).toBe(2);
    expect(firstSource.active()).toBe(0);
    expect(secondSource.active()).toBe(1);

    // Only reaches the component if the dependency swap also reconciled subscriptions.
    act(() => second.set(5));
    expect(result.current).toBe(5);

    unmount();
    expect(secondSource.active()).toBe(0);
  });
});
