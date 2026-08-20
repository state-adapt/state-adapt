import { createAdapter } from '@state-adapt/core';

/**
 * Common reactions and selectors for string state.
 *
 * The `lowercase` and `uppercase` names are available as both reactions and
 * selectors.
 *
 * #### Usage with React
 *
 * ```tsx
 * import { useAdapt } from '@state-adapt/react';
 * import { stringAdapter } from '@state-adapt/core/adapters';
 *
 * export function Label() {
 *   const [text, actions] = useAdapt('State', stringAdapter);
 *
 *   return (
 *     <button onClick={() => actions.concat('Adapt')}>
 *       {text.uppercase}
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
 * import { stringAdapter } from '@state-adapt/core/adapters';
 *
 * @Component({
 *   standalone: true,
 *   selector: 'app-label',
 *   template: `
 *     <button (click)="text.concat('Adapt')">{{ text.uppercase() }}</button>
 *   `,
 * })
 * export class LabelComponent {
 *   text = adapt('State', stringAdapter);
 * }
 * ```
 */
export const stringAdapter = createAdapter<string>()({
  concat: (str, str2) => str + str2,
  lowercase: str => str.toLowerCase(),
  uppercase: str => str.toUpperCase(),
  selectors: {
    lowercase: str => str.toLowerCase(),
    uppercase: str => str.toUpperCase(),
  },
});

/**
 * A string adapter with only the default `set` and `reset` reactions.
 *
 * #### Usage with React
 *
 * ```tsx
 * import { useAdapt } from '@state-adapt/react';
 * import { baseStringAdapter } from '@state-adapt/core/adapters';
 *
 * export function NameField() {
 *   const [name, setName] = useAdapt('', baseStringAdapter);
 *
 *   return (
 *     <input
 *       value={name.state}
 *       onChange={event => setName(event.target.value)}
 *     />
 *   );
 * }
 * ```
 *
 * #### Usage with Angular
 *
 * ```typescript
 * import { Component } from '@angular/core';
 * import { adapt } from '@state-adapt/angular';
 * import { baseStringAdapter } from '@state-adapt/core/adapters';
 *
 * @Component({
 *   standalone: true,
 *   selector: 'app-name-field',
 *   template: `
 *     <input
 *       [value]="name()"
 *       (input)="name.set($any($event.target).value)"
 *     />
 *   `,
 * })
 * export class NameFieldComponent {
 *   name = adapt('', baseStringAdapter);
 * }
 * ```
 */
export const baseStringAdapter = createAdapter<string>()({ selectors: {} });
