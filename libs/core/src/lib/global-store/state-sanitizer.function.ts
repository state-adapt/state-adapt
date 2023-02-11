import {
  globalSelectorsOptions,
  globalSelectorsCache,
  serializeSelectorsCache,
} from '../selectors/memoize-selectors.function';

export function stateSanitizer<T extends { adapt: any }>(state: T): T {
  return {
    ...state,
    ...state.adapt,
    adapt: undefined,
    _prevSelectors: globalSelectorsOptions.devtools
      ? serializeSelectorsCache(globalSelectorsCache)
      : undefined,
  };
}
