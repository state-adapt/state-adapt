import { InitialState } from './state-adapt.types';

export interface InitialStateGetter<State> {
  (): State;
  /** Starts memoization */
  activate(): State;
  /** Stops memoization */
  deactivate(): void;
}

/**
  Normalizes an {@link InitialState} argument into a function that returns the initial state.

  {@link InitialStateGetter.activate} captures a value that stays stable until
  {@link InitialStateGetter.deactivate}.

  Outside of an activation there is no session for a value to belong to, so each call is an
  independent, up-to-the-moment read rather than a cached one.
 */
export function createInitialStateGetter<State>(
  initialState: InitialState<State>,
): InitialStateGetter<State> {
  if (typeof initialState !== 'function') {
    const getInitialState = () => initialState as State;
    return Object.assign(getInitialState, {
      activate: getInitialState,
      deactivate: () => {},
    });
  }

  const createInitialState = initialState as () => State;
  let active = false;
  let state: State | undefined;

  return Object.assign(() => (active ? (state as State) : createInitialState()), {
    activate: () => {
      active = true;
      return (state = createInitialState());
    },
    deactivate: () => {
      active = false;
      state = undefined; // Don't hold onto unused state
    },
  });
}
