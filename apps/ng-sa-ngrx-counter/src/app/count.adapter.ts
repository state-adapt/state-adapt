import { createAdapter } from '@state-adapt/ngrx';

export const countAdapter = createAdapter<number>()({
  increment: (state, n: number) => state + n,
  double: state => state * 2,
});
