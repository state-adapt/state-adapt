import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

export interface GlobalStore<State, AnyAction> {
  subscribe: (observer: any) => void;
  getState: () => State;
  dispatch: (action: AnyAction) => void;
}

export class ObservableStore<
  State,
  AnyAction,
  Action extends AnyAction,
  Store extends GlobalStore<State, AnyAction>,
> extends BehaviorSubject<State> {
  store: Store;
  actionQueue = [] as any[]; // First is currently dispatching

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
    if (!this.actionQueue[0]) {
      this.actionQueue.push(action);
      this.dispatchNext();
    } else {
      this.actionQueue.push(action);
    }
  }

  dispatchNext() {
    if (this.actionQueue[0]) {
      this.store.dispatch(this.actionQueue[0]);
      this.actionQueue.shift();
      this.dispatchNext();
    }
  }
}
