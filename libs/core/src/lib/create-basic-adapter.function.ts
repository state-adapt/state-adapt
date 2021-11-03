import { createAdapter } from './create-adapter.function';

export function createBasicAdapter<T>() {
  return createAdapter<T>()({});
}
