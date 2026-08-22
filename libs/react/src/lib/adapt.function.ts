import {
  AdaptOptions,
  InitialState,
  NotAdaptOptions,
  StateAdapt,
} from '@state-adapt/rxjs';
import { ReactionsWithSelectors, Selectors } from '@state-adapt/core';
import { defaultStateAdapt } from './default-state-adapt.const';
import { ReactStore } from './react-store';

/**
 * See {@link StateAdapt.adapt} for the complete API.
 *
 * This wrapper additionally lets you call the store as a function for its
 * current state, or call a selector property for its current result.
 *
 * ```ts
 * const name = adapt('John', stringAdapter);
 *
 * console.log(name()); // 'John'
 * console.log(name.uppercase()); // 'JOHN'
 * ```
 *
 * See {@link derive} for composing these reads.
 */
export function adapt<
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
  R2 extends ReactionsWithSelectors<State, S>,
  ReturnedSources = unknown,
>(
  initialState: InitialState<State>,
  second:
    | (R & { selectors?: S } & NotAdaptOptions)
    | AdaptOptions<State, S, R2, ReturnedSources> = {},
  // eslint-disable-next-line @typescript-eslint/ban-types -- Literal `{}` preserves deferred generic inference.
): ReactStore<State, S, {} extends R ? R2 : R> {
  return defaultStateAdapt.adapt(initialState, second) as any;
}
