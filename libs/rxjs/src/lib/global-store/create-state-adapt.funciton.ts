import { Adapt } from './adapt';
import { AdaptStore, ObservableStore } from './adapt.store';

export function createStateAdapt<
  State,
  AnyAction,
  Store extends ObservableStore<State, AnyAction>,
>(store: Store) {
  const adaptStore = new AdaptStore<any, AnyAction, any, Store>(store);
  return new Adapt(adaptStore);
}
