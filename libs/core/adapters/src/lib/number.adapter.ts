import { createAdapter } from '@state-adapt/core';

/**
 * Common reactions for number state, including arithmetic helpers.
 *
 * #### Usage with React
 *
 * ```tsx
 * import { useAdapt } from '@state-adapt/react';
 * import { numberAdapter } from '@state-adapt/core/adapters';
 *
 * export function Counter() {
 *   const [count, actions] = useAdapt(0, numberAdapter);
 *
 *   return (
 *     <button onClick={() => actions.increment()}>
 *       Count: {count.state}
 *     </button>
 *   );
 * }
 * ```
 *
 * #### Usage with Angular
 *
 * ```typescript
 * import { Component } from '@angular/core';
 * import { adapt } from '@state-adapt/angular';
 * import { numberAdapter } from '@state-adapt/core/adapters';
 *
 * @Component({
 *   standalone: true,
 *   selector: 'app-counter',
 *   template: `
 *     <button (click)="count.increment()">Count: {{ count() }}</button>
 *   `,
 * })
 * export class CounterComponent {
 *   count = adapt(0, numberAdapter);
 * }
 * ```
 */
export const numberAdapter = createAdapter<number>()({
  increment: n => n + 1,
  decrement: n => n - 1,
  add: (n, n2: number) => n + n2,
  subtract: (n, n2: number) => n - n2,
  multiply: (n, n2: number) => n * n2,
  divide: (n, n2: number) => n / n2,
  pow: (n, pow: number) => Math.pow(n, pow),
  sqrt: n => Math.sqrt(n),
  max: (n, n2: number) => Math.max(n, n2),
  min: (n, n2: number) => Math.min(n, n2),
});

/**
 * A number adapter with only the default `set` and `reset` reactions.
 *
 * #### Usage with React
 *
 * ```tsx
 * import { useAdapt } from '@state-adapt/react';
 * import { baseNumberAdapter } from '@state-adapt/core/adapters';
 *
 * export function Counter() {
 *   const [count, setCount] = useAdapt(0, baseNumberAdapter);
 *
 *   return (
 *     <button onClick={() => setCount(count.state + 1)}>
 *       Count: {count.state}
 *     </button>
 *   );
 * }
 * ```
 *
 * #### Usage with Angular
 *
 * ```typescript
 * import { Component } from '@angular/core';
 * import { adapt } from '@state-adapt/angular';
 * import { baseNumberAdapter } from '@state-adapt/core/adapters';
 *
 * @Component({
 *   standalone: true,
 *   selector: 'app-counter',
 *   template: `
 *     <button (click)="count.set(count() + 1)">Count: {{ count() }}</button>
 *   `,
 * })
 * export class CounterComponent {
 *   count = adapt(0, baseNumberAdapter);
 * }
 * ```
 */
export const baseNumberAdapter = createAdapter<number>()({ selectors: {} });
