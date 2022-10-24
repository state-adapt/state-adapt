import { createAdapter } from '@state-adapt/core';

export const numberAdapter = createAdapter<number>()({
  increment: n => n + 1,
  decrement: n => n - 1,
  add: (n, n2: number) => n + n2,
  substract: (n, n2: number) => n - n2,
  multiply: (n, n2: number) => n * n2,
  divide: (n, n2: number) => n / n2,
  pow: (n, pow: number) => Math.pow(n, pow),
  sqrt: n => Math.sqrt(n),
  max: (n, n2: number) => Math.max(n, n2),
  min: (n, n2: number) => Math.min(n, n2),
});
