import {
  globalSelectorsCache,
  serializeSelectorsCache,
} from '../selectors/memoize-selectors.function';

export const showSelectorsInDevtools = '__stateadapt_enable_selectors_in_devdools';
const showSelectorsYesOptions = [undefined, true];

export function stateSanitizer<T extends { adapt: any }>(state: T): T {
  return {
    ...state,
    ...state.adapt,
    adapt: undefined,
    _prevSelectors: showSelectorsYesOptions.includes(
      (window as any)[showSelectorsInDevtools],
    )
      ? serializeSelectorsCache(globalSelectorsCache)
      : undefined,
  };
}
