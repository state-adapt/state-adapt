import { AdaptCommon, createAdapter, Source } from '@state-adapt/core';

interface EntityListAsyncState<T> {
  list: T[];
  loading: boolean;
  error: any;
}

const initialEntityListAsyncState = {
  list: [],
  loading: false,
  error: null,
};

export class EntityListAsyncAdapter<T> {
  // event handlers
  request$ = new Source<void>('[' + this.entityName + 'List] Requested');
  receive$ = new Source<T[]>('[' + this.entityName + 'List] Received');
  flush$ = new Source<void>('[' + this.entityName + 'List] Flushed');
  error$ = new Source<any>('[' + this.entityName + 'List] Error Triggered');

  store = this.adapt.init(
    [
      this.entityName,
      this.createEntityListAdapter(),
      initialEntityListAsyncState,
    ],
    {
      request: this.request$,
      receive: this.receive$,
      flush: this.flush$,
      error: this.error$,
    }
  );

  private createEntityListAdapter() {
    return createAdapter<EntityListAsyncState<T>>()({
      request: (state) => ({ ...state, loading: true }),
      receive: (state, list: T[]) => ({
        ...state,
        list,
        loading: false,
        error: null,
      }),

      error: (state, error: any) => ({
        ...state,
        error,
        list: [],
        loading: false,
      }),

      flush: (state) => ({
        ...state,
        entity: [],
        loading: false,
        error: null,
      }),

      getSelectors: () => ({
        getList: (state) => state.list,
        getLoading: (state) => state.loading,
        getError: (state) => state.loading,
      }),
    });
  }

  constructor(private entityName: string, private adapt: AdaptCommon<any>) {}
}
