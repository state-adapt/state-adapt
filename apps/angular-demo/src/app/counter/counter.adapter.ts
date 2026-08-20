import { createAdapter } from '@state-adapt/core';

/**
 * A plain adapter: state change functions plus derived selectors, defined once
 * and reusable by any number of stores.
 */
export const counterAdapter = createAdapter<number>()({
  increment: (state, step: number) => state + step,
  decrement: (state, step: number) => state - step,
  double: state => state * 2,
  negate: state => state * -1,
  selectors: {
    isEven: state => state % 2 === 0,
    parity: state => (state % 2 === 0 ? 'even' : 'odd'),
    isNegative: state => state < 0,
  },
});
