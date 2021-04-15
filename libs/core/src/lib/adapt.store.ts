import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

export interface ObservableStore<State, AnyAction> {
  subscribe: (observer: any) => void;
  getState: () => State;
  dispatch: (action: AnyAction) => void;
}

export class AdaptStore<
  State,
  AnyAction,
  Action extends AnyAction,
  Store extends ObservableStore<State, AnyAction>
> extends BehaviorSubject<State> {
  store: Store;

  constructor(store: Store) {
    super(store.getState());
    this.store = store;
    store.subscribe(() => this.next(store.getState()));
  }

  select<T>(sel: (s: State) => T) {
    return this.pipe(
      filter(state => state !== undefined),
      map(state => sel(state)),
      filter(state => state !== undefined),
      distinctUntilChanged(),
    );
  }

  dispatch(action: Action) {
    return this.store.dispatch(action);
  }
}
