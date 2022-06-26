import { createSelectors } from './create-selectors.function';

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
};

const selectors = createSelectors<TestState>()({
  getA1000: s => {
    runTimes.getA1000++;
    return s.a * 1000;
  },
  getB1000: s => {
    runTimes.getB1000++;
    return s.b * 1000;
  },
});

const selectors2 = createSelectors<TestState>()(selectors, {
  getA1000MinusB1000: s => {
    runTimes.getA1000MinusB1000++;
    return s.getA1000 - s.getB1000;
  },
  getA1000PlusB1000: s => {
    runTimes.getA1000PlusB1000++;
    return s.getA1000 + s.getB1000;
  },
});

describe('combineSelectors', () => {
  const state1 = { a: 4, b: 3, c: 0 };

  const minus = selectors2.getA1000MinusB1000(state1);
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
    });
  });

  const plus = selectors2.getA1000PlusB1000(state1);
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
    });
  });

  // ================ 1ST STATE CHANGE ====================
  const state2 = { ...state1, c: 1 };

  const minus2 = selectors2.getA1000MinusB1000(state2);
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
    });
  });

  const plus2 = selectors2.getA1000PlusB1000(state2);
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
    });
  });

  // ================ 2ND STATE CHANGE ====================
  const state3 = { ...state2, b: 2 };

  const minus3 = selectors2.getA1000MinusB1000(state3);
  const runTimes3m = copy(runTimes);
  it('minus3 should equal 1000', () => {
    expect(minus3).toBe(2000);
  });
  it('runTimes3m run times', () => {
    expect(runTimes3m).toEqual({
      getA1000: 3,
      getB1000: 3,
      getA1000MinusB1000: 2,
      getA1000PlusB1000: 1, // Has not been selected a 2nd time yet
    });
  });

  const plus3 = selectors2.getA1000PlusB1000(state3);
  const runTimes3p = copy(runTimes);
  it('plus3 should equal 7000', () => {
    expect(plus3).toBe(6000);
  });
  it('runTimes3p run times', () => {
    expect(runTimes3p).toEqual({
      getA1000: 3,
      getB1000: 3,
      getA1000MinusB1000: 2,
      getA1000PlusB1000: 2,
    });
  });
});
