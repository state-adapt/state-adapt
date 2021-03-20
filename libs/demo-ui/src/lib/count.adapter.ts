import { createAdapter } from '@state-adapt/core';

export const countAdapter = createAdapter<number>()({
  increment: (state, n: number) => state + n,
  decrement: state => state - 1,
  reset: (state, payload, initialState) => initialState,
});
