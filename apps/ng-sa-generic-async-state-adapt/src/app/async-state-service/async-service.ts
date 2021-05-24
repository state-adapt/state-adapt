import { AsyncStateAdapter } from '../async-state-adapter';

export interface AsyncService<T> {
  adapter: AsyncStateAdapter<T>;
}
