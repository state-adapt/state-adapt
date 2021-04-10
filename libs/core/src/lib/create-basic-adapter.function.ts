import { createAdapter } from './create-adapter.function';

export function createBasicAdapter<T>() {
  return createAdapter<T>()({
    set: (state, newState: T) => newState,
    update: (state, update: Partial<T>) => ({ ...state, ...update }),
    reset: (state, payload, initialState) => initialState,
  });
}
