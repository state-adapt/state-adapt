import { createStateAdapt } from './create-state-adapt.function';

/**
 * The StateAdapt instance used by the React integration when no custom
 * `AdaptContext.Provider` is present.
 */
export const defaultStateAdapt = createStateAdapt();
