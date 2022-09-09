import { createAdapter } from '@state-adapt/angular';

export const countAdapter = createAdapter<number>()({
  increment: (state, n: number) => state + n,
  double: state => state * 2,
  selectors: {
    s: s => s.toString(),
  },
});
