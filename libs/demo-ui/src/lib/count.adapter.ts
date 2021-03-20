import { createAdapter } from '@state-adapt/core';

export const countAdapter = createAdapter<number>()({
  increment: state => state + 1,
  decrement: state => state - 1,
  reset: (state, payload, initialState) => initialState,
});
