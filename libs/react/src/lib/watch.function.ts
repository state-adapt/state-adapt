import { StateAdapt } from '@state-adapt/rxjs';
import {
  Adapter,
  BasicAdapterMethods,
  ReactionsWithSelectors,
  Selectors,
} from '@state-adapt/core';
import { defaultStateAdapt } from './default-state-adapt.const';
import { ReactWatch } from './react-store';

/**
 * See {@link StateAdapt.watch} for the complete API.
 *
 * This wrapper additionally lets you call the store as a function for its
 * current state, or call a selector property for its current result.
 *
 * ```ts
 * import { stringAdapter } from '@state-adapt/core/adapters';
 * import { watch } from '@state-adapt/react';
 *
 * const name = watch('name', stringAdapter);
 *
 * // While the store at "name" is active:
 * console.log(name()); // 'John'
 * console.log(name.uppercase()); // 'JOHN'
 * ```
 *
 * Reads are `undefined` while the store is inactive and do not activate its
 * sources. See {@link derive} for composing these reads.
 */
export function watch<
  State = any,
  // eslint-disable-next-line @typescript-eslint/ban-types -- Intentional empty generic default.
  S extends Selectors<State> = {},
  // eslint-disable-next-line @typescript-eslint/ban-types -- Intentional empty generic default.
  R extends ReactionsWithSelectors<State, S> = {},
>(
  path: string,
  adapter?: Adapter<State, S, R & BasicAdapterMethods<State>>,
): ReactWatch<State, S> {
  return defaultStateAdapt.watch(path, adapter);
}
