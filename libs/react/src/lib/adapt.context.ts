import { configureStateAdapt } from '@state-adapt/rxjs';
import React from 'react';

/**
 * The StateAdapt instance used by the React integration when no custom
 * `AdaptContext.Provider` is present.
 *
 * Most applications can import {@link adapt} and {@link watch} directly instead
 * of using this instance.
 */
export const defaultStateAdapt = configureStateAdapt();

/**
 * Creates a store using React's default StateAdapt configuration.
 *
 * This function is bound to {@link defaultStateAdapt}. A custom
 * `AdaptContext.Provider` affects hooks, but it cannot change stores created at
 * module scope. For custom configuration, export `adapt` from the configured
 * instance instead.
 */
export const adapt = defaultStateAdapt.adapt;

/**
 * Watches a store path using React's default StateAdapt configuration.
 *
 * This function is bound to {@link defaultStateAdapt}. For custom configuration,
 * export `watch` from the configured instance instead.
 */
export const watch = defaultStateAdapt.watch;

/**
 * Supplies a custom StateAdapt configuration to StateAdapt's React hooks.
 *
 * The context already contains {@link defaultStateAdapt}, so applications only
 * need to render a provider when they want to customize the configuration.
 *
 * @example
 * ```tsx
 * import { AdaptContext } from '@state-adapt/react';
 * import { configureStateAdapt } from '@state-adapt/rxjs';
 *
 * const stateAdapt = configureStateAdapt({ showSelectors: false });
 *
 * root.render(
 *   <AdaptContext.Provider value={stateAdapt}>
 *     <App />
 *   </AdaptContext.Provider>,
 * );
 * ```
 */
// The types may be too complicated, because even value={defaultStateAdapt} doesn't work without typing it explicitly:
export const AdaptContext = React.createContext<{ adapt: any; watch: any }>(
  defaultStateAdapt,
);
