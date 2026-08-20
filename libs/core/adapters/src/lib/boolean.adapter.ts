import { createAdapter } from '@state-adapt/core';

/**
 * Changes boolean state with `setTrue`, `setFalse`, or `toggle`.
 *
 * #### Usage with React
 *
 * ```tsx
 * import { useAdapt } from '@state-adapt/react';
 * import { booleanAdapter } from '@state-adapt/core/adapters';
 *
 * export function Toggle() {
 *   const [enabled, actions] = useAdapt(false, booleanAdapter);
 *
 *   return (
 *     <button onClick={() => actions.toggle()}>
 *       {enabled.state ? 'On' : 'Off'}
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
 * import { booleanAdapter } from '@state-adapt/core/adapters';
 *
 * @Component({
 *   standalone: true,
 *   selector: 'app-toggle',
 *   template: `
 *     <button (click)="enabled.toggle()">
 *       {{ enabled() ? 'On' : 'Off' }}
 *     </button>
 *   `,
 * })
 * export class ToggleComponent {
 *   enabled = adapt(false, booleanAdapter);
 * }
 * ```
 */
export const booleanAdapter = createAdapter<boolean>()({
  setTrue: () => true,
  setFalse: () => false,
  toggle: state => !state,
});

/**
 * A boolean adapter with only the default `set` and `reset` reactions.
 *
 * Use this as a small building block with `joinAdapters`.
 *
 * #### Usage with React
 *
 * ```tsx
 * import { useAdapt } from '@state-adapt/react';
 * import { baseBooleanAdapter } from '@state-adapt/core/adapters';
 *
 * export function Toggle() {
 *   const [enabled, setEnabled] = useAdapt(false, baseBooleanAdapter);
 *
 *   return (
 *     <button onClick={() => setEnabled(!enabled.state)}>
 *       {enabled.state ? 'On' : 'Off'}
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
 * import { baseBooleanAdapter } from '@state-adapt/core/adapters';
 *
 * @Component({
 *   standalone: true,
 *   selector: 'app-toggle',
 *   template: `
 *     <button (click)="enabled.set(!enabled())">
 *       {{ enabled() ? 'On' : 'Off' }}
 *     </button>
 *   `,
 * })
 * export class ToggleComponent {
 *   enabled = adapt(false, baseBooleanAdapter);
 * }
 * ```
 */
export const baseBooleanAdapter = createAdapter<boolean>()({});
