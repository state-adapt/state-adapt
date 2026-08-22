import {
  configureStateAdapt as configureRxStateAdapt,
  ConfigureStateAdaptOptions,
} from '@state-adapt/rxjs';
import { createReactAdapt, createReactWatch } from './react-store';

/**
 * Creates a StateAdapt instance with the provided configuration. See
 * {@link ConfigureStateAdaptOptions} for every available option.
 *
 * Define the configuration in one module and export its {@link adapt} and
 * {@link watch} functions from there. This example disables Redux DevTools:
 *
 * ```ts
 * // state-adapt.ts
 * import { createStateAdapt } from '@state-adapt/react';
 *
 * export const stateAdapt = createStateAdapt({ devtools: null });
 * export const { adapt, watch } = stateAdapt;
 * ```
 *
 * Import the store functions from that module wherever you create stores:
 *
 * ```ts
 * // counter.store.ts
 * import { adapt } from './state-adapt';
 *
 * export const countStore = adapt(5);
 * ```
 *
 * Provide the same instance to the React hooks at the root of your app through
 * {@link AdaptContext}:
 *
 * ```tsx
 * // main.tsx
 * import { AdaptContext } from '@state-adapt/react';
 * import { stateAdapt } from './state-adapt';
 *
 * root.render(
 *   <AdaptContext.Provider value={stateAdapt}>
 *     <App />
 *   </AdaptContext.Provider>,
 * );
 * ```
 *
 * #### Keep custom configuration imports consistent
 *
 * The package-level `adapt` and `watch` always use the default configuration
 * ({@link defaultStateAdapt}). With a custom configuration, import them from
 * your application's `state-adapt.ts` module and provide that same
 * `stateAdapt` through {@link AdaptContext}. Only combine stores created by
 * the same instance.
 *
 * StateAdapt stops unsafe combinations with these errors:
 *
 * ```text
 * StateAdapt Error: This store was created by a different StateAdapt instance
 * than the one provided to React through AdaptContext. Make sure the store and
 * React use the same StateAdapt instance. If you created an instance with
 * createStateAdapt, provide that instance through AdaptContext and import adapt
 * and watch from the module where you called createStateAdapt instead of
 * @state-adapt/react.
 * ```
 *
 * ```text
 * StateAdapt Error: derive cannot combine stores created by different
 * StateAdapt instances.
 * ```
 *
 * ```text
 * StateAdapt Error: joinStores cannot combine stores created by different
 * StateAdapt instances.
 * ```
 *
 * To help ensure that `adapt`, `watch`, and `defaultStateAdapt` are imported
 * from the correct place, custom-configured applications can add this ESLint
 * rule:
 *
 * ```js
 * // eslint.config.js
 * {
 *   rules: {
 *     'no-restricted-imports': [
 *       'error',
 *       {
 *         paths: [
 *           {
 *             name: '@state-adapt/react',
 *             importNames: ['adapt', 'watch', 'defaultStateAdapt'],
 *             message:
 *               'Import this from your application state-adapt.ts module when using custom StateAdapt configuration.',
 *           },
 *         ],
 *       },
 *     ],
 *   },
 * }
 * ```
 */
export function createStateAdapt(options?: ConfigureStateAdaptOptions) {
  const stateAdapt = configureRxStateAdapt(options);
  return {
    ...stateAdapt,
    adapt: createReactAdapt(stateAdapt.adapt),
    watch: createReactWatch(stateAdapt.watch),
  };
}
