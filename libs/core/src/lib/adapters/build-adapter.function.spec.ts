import { buildAdapter } from './build-adapter.function';
import {
  SelectorsCache,
  createSelectorsCache,
} from '../selectors/memoize-selectors.function';

interface TestState {
  a: number;
  b: number;
  c: number;
}

const getAdapter = () => {
  const getA3 = jest.fn((s: TestState) => s.a * 3);
  const getA1000 = jest.fn((s: TestState) => s.a * 1000);
  const getB1000 = jest.fn((s: TestState) => s.b * 1000);
  const getA1000MinusB1000 = jest.fn(
    (s: { getA1000: number; getB1000: number }) => s.getA1000 - s.getB1000,
  );
  const getA1000PlusB1000 = jest.fn(
    (s: { getA1000: number; getB1000: number }) => s.getA1000 + s.getB1000,
  );
  const final = jest.fn((s: { getA1000MinusB1000: number }) => s.getA1000MinusB1000);
  const adapter = buildAdapter<TestState>()({
    addToAll: (state, payload: number) => ({
      a: state.a + payload,
      b: state.b + payload,
      c: state.c + payload,
    }),
    selectors: {
      getA2: s => s.a * 2,
      getA3,
      getA1000,
      getB1000,
    },
  })({
    getA1000MinusB1000,
    getA1000PlusB1000,
  })({
    final,
  })(([selectors, reactions]) => ({
    add5ToAll: state => reactions.addToAll(state, 5),
    addA3ToAllUsingSelectorWithCache: (state, _payload: void, _initialState, cache) =>
      reactions.addToAll(state, selectors.getA3(state, cache)),
  }))();

  return {
    adapter,
    selectors: adapter.selectors,
    getA3,
    getA1000,
    getB1000,
    getA1000MinusB1000,
    getA1000PlusB1000,
    final,
  };
};

const getDynamicSelectors = () => {
  const primary = jest.fn((s: { primary: number }) => s.primary);
  const secondary = jest.fn((s: { secondary: number }) => s.secondary);
  const value = jest.fn(
    (selectors: { usePrimary: boolean; primary: number; secondary: number }) =>
      selectors.usePrimary ? selectors.primary : selectors.secondary,
  );
  const adapter = buildAdapter<{
    usePrimary: boolean;
    primary: number;
    secondary: number;
  }>()({
    selectors: {
      usePrimary: state => state.usePrimary,
      primary,
      secondary,
    },
  })({ value })();

  return { selectors: adapter.selectors, primary, secondary, value };
};

describe('buildAdapter', () => {
  it('should handle state changes correctly', () => {
    const { adapter } = getAdapter();
    const state = { a: 4, b: 3, c: 0 };

    const newState = adapter.addToAll(state, 1);

    expect(newState).toEqual({ a: 5, b: 4, c: 1 });
  });

  it('should handle added state changes correctly', () => {
    const { adapter } = getAdapter();
    const state = { a: 4, b: 3, c: 0 };

    const newState = adapter.add5ToAll(state);

    expect(newState).toEqual({ a: 9, b: 8, c: 5 });
  });

  it('should handle added state changes correctly using selector with cache', () => {
    const { adapter, selectors, getA3 } = getAdapter();
    const cache = createSelectorsCache();
    const state = { a: 4, b: 3, c: 0 };

    expect(selectors.getA3(state, cache)).toBe(12);
    expect(
      adapter.addA3ToAllUsingSelectorWithCache(
        state,
        undefined,
        state,
        undefined as unknown as SelectorsCache,
      ),
    ).toEqual({ a: 16, b: 15, c: 12 });
    expect(
      adapter.addA3ToAllUsingSelectorWithCache(state, undefined, state, cache),
    ).toEqual({ a: 16, b: 15, c: 12 });

    expect(getA3).toHaveBeenCalledTimes(2);
  });

  it('should share input selector results between derived selectors', () => {
    const { selectors, getA1000, getB1000, getA1000MinusB1000, getA1000PlusB1000 } =
      getAdapter();
    const cache = createSelectorsCache();
    const state = { a: 4, b: 3, c: 0 };

    expect(selectors.getA1000MinusB1000(state, cache)).toBe(1000);
    expect(selectors.getA1000PlusB1000(state, cache)).toBe(7000);

    expect(getA1000).toHaveBeenCalledTimes(1);
    expect(getB1000).toHaveBeenCalledTimes(1);
    expect(getA1000MinusB1000).toHaveBeenCalledTimes(1);
    expect(getA1000PlusB1000).toHaveBeenCalledTimes(1);
  });

  it('should not recalculate derived selectors when input results are unchanged', () => {
    const { selectors, getA1000, getB1000, getA1000MinusB1000, getA1000PlusB1000 } =
      getAdapter();
    const cache = createSelectorsCache();
    const state = { a: 4, b: 3, c: 0 };
    const stateWithNewC = { ...state, c: 1 };

    expect(selectors.getA1000MinusB1000(state, cache)).toBe(1000);
    expect(selectors.getA1000PlusB1000(state, cache)).toBe(7000);
    expect(selectors.getA1000MinusB1000(stateWithNewC, cache)).toBe(1000);
    expect(selectors.getA1000PlusB1000(stateWithNewC, cache)).toBe(7000);

    expect(getA1000).toHaveBeenCalledTimes(2);
    expect(getB1000).toHaveBeenCalledTimes(2);
    expect(getA1000MinusB1000).toHaveBeenCalledTimes(1);
    expect(getA1000PlusB1000).toHaveBeenCalledTimes(1);
  });

  it('should recalculate derived selectors when an input result changes', () => {
    const { selectors, getA1000, getB1000, getA1000MinusB1000, getA1000PlusB1000 } =
      getAdapter();
    const cache = createSelectorsCache();
    const state = { a: 4, b: 3, c: 0 };
    const stateWithNewB = { ...state, b: 2 };

    expect(selectors.getA1000MinusB1000(state, cache)).toBe(1000);
    expect(selectors.getA1000PlusB1000(state, cache)).toBe(7000);
    expect(selectors.getA1000MinusB1000(stateWithNewB, cache)).toBe(2000);
    expect(selectors.getA1000PlusB1000(stateWithNewB, cache)).toBe(6000);

    expect(getA1000).toHaveBeenCalledTimes(2);
    expect(getB1000).toHaveBeenCalledTimes(2);
    expect(getA1000MinusB1000).toHaveBeenCalledTimes(2);
    expect(getA1000PlusB1000).toHaveBeenCalledTimes(2);
  });

  it('should memoize selector results separately for each cache', () => {
    const { selectors, getA1000, getB1000, getA1000MinusB1000, final } = getAdapter();
    const cache1 = createSelectorsCache();
    const cache2 = createSelectorsCache();
    const state = { a: 4, b: 3, c: 0 };

    expect(selectors.final(state, cache1)).toBe(1000);
    expect(selectors.final(state, cache1)).toBe(1000);
    expect(selectors.final(state, cache2)).toBe(1000);

    expect(getA1000).toHaveBeenCalledTimes(2);
    expect(getB1000).toHaveBeenCalledTimes(2);
    expect(getA1000MinusB1000).toHaveBeenCalledTimes(2);
    expect(final).toHaveBeenCalledTimes(2);
  });

  it('should memoize selectors through multiple derived layers', () => {
    const { selectors, getA1000, getB1000, getA1000MinusB1000, final } = getAdapter();
    const cache = createSelectorsCache();
    const state = { a: 4, b: 3, c: 0 };
    const stateWithNewC = { ...state, c: 1 };
    const stateWithNewB = { ...stateWithNewC, b: 2 };

    expect(selectors.final(state, cache)).toBe(1000);
    expect(selectors.final(stateWithNewC, cache)).toBe(1000);
    expect(selectors.final(stateWithNewB, cache)).toBe(2000);

    expect(getA1000).toHaveBeenCalledTimes(3);
    expect(getB1000).toHaveBeenCalledTimes(3);
    expect(getA1000MinusB1000).toHaveBeenCalledTimes(2);
    expect(final).toHaveBeenCalledTimes(2);
  });

  it('should stop checking unused selectors when dependencies change', () => {
    const { selectors, primary, secondary, value } = getDynamicSelectors();
    const cache = createSelectorsCache();

    expect(selectors.value({ usePrimary: true, primary: 1, secondary: 2 }, cache)).toBe(
      1,
    );
    expect(selectors.value({ usePrimary: false, primary: 1, secondary: 2 }, cache)).toBe(
      2,
    );
    expect(selectors.value({ usePrimary: false, primary: 99, secondary: 2 }, cache)).toBe(
      2,
    );

    expect(primary).toHaveBeenCalledTimes(1);
    expect(secondary).toHaveBeenCalledTimes(2);
    expect(value).toHaveBeenCalledTimes(2);
  });

  it('should only check selectors used in the latest run', () => {
    const { selectors, primary, secondary, value } = getDynamicSelectors();
    const cache = createSelectorsCache();

    selectors.value({ usePrimary: true, primary: 1, secondary: 2 }, cache);
    selectors.value({ usePrimary: false, primary: 1, secondary: 2 }, cache);
    selectors.value({ usePrimary: true, primary: 1, secondary: 2 }, cache);
    expect(selectors.value({ usePrimary: true, primary: 1, secondary: 99 }, cache)).toBe(
      1,
    );

    expect(primary).toHaveBeenCalledTimes(3);
    expect(secondary).toHaveBeenCalledTimes(1);
    expect(value).toHaveBeenCalledTimes(3);
  });
});
