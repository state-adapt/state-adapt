import { createAdapter } from '@state-adapt/core';

export const countAdapter = createAdapter<number>()({
  increment: (state, n: number) => state + n,
  double: state => state * 2,
  reset: (state, payload, initialState) => initialState,
});
