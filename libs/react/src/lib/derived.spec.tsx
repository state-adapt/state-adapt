import { act, renderHook } from '@testing-library/react';
import { adapt } from './adapt.function';
import { createStateAdapt } from './create-state-adapt.function';
import { derive } from './derived';
import { useDerived } from './use-derived';

describe('derive', () => {
  it('reuses the existing selector memoization across direct reads', () => {
    const count = adapt(2);
    let projectorCalls = 0;
    const quadruple = derive(() => {
      projectorCalls++;
      return count() * 4;
    });

    expect(quadruple()).toBe(8);
    expect(quadruple()).toBe(8);
    expect(projectorCalls).toBe(1);
  });

  it('shares projector work across React consumers', () => {
    const count = adapt(1);
    let projectorCalls = 0;
    const double = derive(() => {
      projectorCalls++;
      return count() * 2;
    });

    const first = renderHook(() => useDerived(double));
    const second = renderHook(() => useDerived(double));

    expect(first.result.current).toBe(2);
    expect(second.result.current).toBe(2);
    expect(projectorCalls).toBe(1);

    act(() => count.set(2));

    expect(first.result.current).toBe(4);
    expect(second.result.current).toBe(4);
    expect(projectorCalls).toBe(2);

    first.unmount();
    second.unmount();
  });

  it('does not recalculate or rerender when a used selector is unchanged', () => {
    const state = adapt(
      { selected: 1, unrelated: 1 },
      {
        adapter: {
          selectors: {
            selected: value => value.selected,
          },
        },
      },
    );
    let projectorCalls = 0;
    let renders = 0;
    const selected = derive(() => {
      projectorCalls++;
      return state.selected();
    });

    const { result, unmount } = renderHook(() => {
      renders++;
      return useDerived(selected);
    });

    expect(result.current).toBe(1);
    expect(projectorCalls).toBe(1);
    expect(renders).toBe(1);

    act(() => state.update({ unrelated: 2 }));

    expect(result.current).toBe(1);
    expect(projectorCalls).toBe(1);
    expect(renders).toBe(1);

    unmount();
  });

  it('rejects stores from different StateAdapt instances', () => {
    const foreignStateAdapt = createStateAdapt({ devtools: null });
    const foreignStore = foreignStateAdapt.adapt(1);
    const local = adapt(1);
    const mixed = derive(() => local() + foreignStore());
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useDerived(mixed))).toThrow(
      'StateAdapt Error: derive cannot combine stores created by different StateAdapt instances.',
    );

    consoleError.mockRestore();
  });
});
