import { AdaptCommon, createAdapter, Source } from '@state-adapt/core';

interface EntityAsyncState<T> {
  entity: T | null;
  loading: boolean;
  error: any;
}

const initialEntityAsyncState = {
  entity: null,
  loading: false,
  error: null,
};

export class EntityAsyncAdapter<T> {
  // event handlers
  request$ = new Source<void>('[' + this.entityName + '] Requested');
  receive$ = new Source<T>('[' + this.entityName + '] Received');
  flush$ = new Source<void>('[' + this.entityName + '] Flushed');
  error$ = new Source<any>('[' + this.entityName + '] Error Triggered');

  store = this.adapt.init(
    [this.entityName, this.createEntityAdapter(), initialEntityAsyncState],
    {
      request: this.request$,
      receive: this.receive$,
      flush: this.flush$,
      error: this.error$,
    }
  );

  private createEntityAdapter() {
    return createAdapter<EntityAsyncState<T>>()({
      request: (state) => ({ ...state, loading: true }),
      receive: (state, entity: T) => ({
        ...state,
        entity,
        loading: false,
        error: null,
      }),

      error: (state, error: any) => ({
        ...state,
        error,
        entity: null,
        loading: false,
      }),

      flush: (state) => ({
        ...state,
        entity: null,
        loading: false,
        error: null,
      }),

      getSelectors: () => ({
        getEntity: (state) => state.entity,
        getLoading: (state) => state.loading,
        getError: (state) => state.loading,
      }),
    });
  }

  constructor(private entityName: string, private adapt: AdaptCommon<any>) {}
}
