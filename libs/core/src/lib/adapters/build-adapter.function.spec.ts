import { buildAdapter } from './build-adapter.function';
import { createSelectorsCache } from '../selectors/memoize-selectors.function';

const copy = (a: any) => JSON.parse(JSON.stringify(a));

interface TestState {
  a: number;
  b: number;
  c: number;
}

const runTimes = {
  getA1000: 0,
  getB1000: 0,
  getA1000MinusB1000: 0,
  getA1000PlusB1000: 0,
  final: 0,
};

const selectors = buildAdapter<TestState>()({
  selectors: {
    getA1000: s => {
      runTimes.getA1000++;
      return s.a * 1000;
    },
    getB1000: s => {
      runTimes.getB1000++;
      return s.b * 1000;
    },
  },
})({
  getA1000MinusB1000: s => {
    runTimes.getA1000MinusB1000++;
    return s.getA1000 - s.getB1000;
  },
  getA1000PlusB1000: s => {
    runTimes.getA1000PlusB1000++;
    return s.getA1000 + s.getB1000;
  },
})({
  final: s => {
    runTimes.final++;
    return s.getA1000MinusB1000;
  },
})().selectors;

const cache1 = createSelectorsCache();
const cache2 = createSelectorsCache();

describe('buildAdapter', () => {
  const state1 = { a: 4, b: 3, c: 0 };

  const minus = selectors.getA1000MinusB1000(state1, cache1);
  const runTimes1m = copy(runTimes);

  it('minus should equal 1000', () => {
    expect(minus).toBe(1000);
  });
  it('runTimes1m run times', () => {
    expect(runTimes1m).toEqual({
      getA1000: 1,
      getB1000: 1,
      getA1000MinusB1000: 1,
      getA1000PlusB1000: 0, // Not selected yet
      final: 0,
    });
  });

  const plus = selectors.getA1000PlusB1000(state1, cache1);
  const runTimes1p = copy(runTimes);

  it('plus should equal 7000', () => {
    expect(plus).toBe(7000);
  });
  it('runTimes1p run times', () => {
    expect(runTimes1p).toEqual({
      getA1000: 1, // Same state object, so these input selectors still cached
      getB1000: 1,
      getA1000MinusB1000: 1,
      getA1000PlusB1000: 1,
      final: 0,
    });
  });

  // ================ 1ST STATE CHANGE ====================
  const state2 = { ...state1, c: 1 };

  const minus2 = selectors.getA1000MinusB1000(state2, cache1);
  const runTimes2m = copy(runTimes);
  it('minus2 should equal 1000', () => {
    expect(minus2).toBe(1000);
  });
  it('runTimes2m run times', () => {
    expect(runTimes2m).toEqual({
      getA1000: 2,
      getB1000: 2,
      getA1000MinusB1000: 1, // Same input selector results, so no need to run this again
      getA1000PlusB1000: 1,
      final: 0,
    });
  });

  const plus2 = selectors.getA1000PlusB1000(state2, cache1);
  const runTimes2p = copy(runTimes);
  it('plus2 should equal 7000', () => {
    expect(plus2).toBe(7000);
  });
  it('runTimes2p run times', () => {
    expect(runTimes2p).toEqual({
      getA1000: 2,
      getB1000: 2,
      getA1000MinusB1000: 1,
      getA1000PlusB1000: 1,
      final: 0,
    });
  });

  // ================ 2ND STATE CHANGE ====================
  const state3 = { ...state2, b: 2 };

  const minus3 = selectors.getA1000MinusB1000(state3, cache1);
  const runTimes3m = copy(runTimes);
  it('minus3 should equal 2000', () => {
    expect(minus3).toBe(2000);
  });
  it('runTimes3m run times', () => {
    expect(runTimes3m).toEqual({
      getA1000: 3,
      getB1000: 3,
      getA1000MinusB1000: 2,
      getA1000PlusB1000: 1, // Has not been selected a 2nd time yet
      final: 0,
    });
  });

  const plus3 = selectors.getA1000PlusB1000(state3, cache1);
  const runTimes3p = copy(runTimes);
  it('plus3 should equal 6000', () => {
    expect(plus3).toBe(6000);
  });
  it('runTimes3p run times', () => {
    expect(runTimes3p).toEqual({
      getA1000: 3,
      getB1000: 3,
      getA1000MinusB1000: 2,
      getA1000PlusB1000: 2,
      final: 0,
    });
  });

  // =============================== Separate Memoization & Final Selector Memoization =================================
  // Do something with Store 2. Hopefully it uses a different selector, causing all selectors to run again. Separate memoization
  selectors.final(state3, cache2);
  const store2RunTimes1m = copy(runTimes);
  it('should add full run times for 2nd copy of selectors even though using state3 again', () => {
    expect(store2RunTimes1m).toEqual({
      getA1000: 4,
      getB1000: 4,
      getA1000MinusB1000: 3,
      getA1000PlusB1000: 2, // Not selected yet
      final: 1,
    });
  });

  //
  selectors.final({ a: 10, b: 20, c: 30 }, cache1);
  selectors.final(state3, cache2);
  selectors.final({ a: 100, b: 200, c: 300 }, cache1);
  selectors.final(state3, cache2);
  selectors.final({ a: 1000, b: 2000, c: 3000 }, cache1);
  selectors.final({ ...state3, c: 9090 }, cache2); // top input selectors need to run again
  selectors.final({ a: 10000, b: 2000, c: 30000 }, cache1);
  selectors.final(state3, cache2); // top input selectors need to run again
  const runTimes3mAgain = copy(runTimes);
  it('should run final selector only 4 more times', () => {
    expect(runTimes3mAgain).toEqual({
      getA1000: 10,
      getB1000: 10,
      getA1000MinusB1000: 7,
      getA1000PlusB1000: 2, // Still not selected
      final: 5,
    });
  });
});
