import { AdaptCommon, createAdapter, Source } from '@state-adapt/core';

interface AsyncState<T> {
  entity: T | null;
  list: T[];
  waiting: boolean;
  error: Error | null;
  commandAccepted: boolean;
}

const initialAsyncState = {
  entity: null,
  list: [],
  waiting: false,
  error: null,
  commandAccepted: false,
};

export class AsyncStateAdapter<T> {
  constructor(
    private adapt: AdaptCommon<any>,
    private featureName: string,
    private commandSourceList: Source<any>[],
  ) {}

  // event handlers
  commandAccepted$ = new Source<void>(
    '[' + this.featureName + '] Command Accepted',
  );
  entityChanged$ = new Source<T>('[' + this.featureName + '] Entity Changed');
  listChanged$ = new Source<T[]>('[' + this.featureName + '] List Changed');
  errorThrown$ = new Source<any>('[' + this.featureName + '] Error Thrown');
  reset$ = new Source<void>('[' + this.featureName + '] Reset');

  store = this.adapt.init(
    [this.featureName, this.createAsyncEntityAdapter(), initialAsyncState],
    {
      sendCommand: this.commandSourceList,
      acceptCommand: this.commandAccepted$,
      throwError: this.errorThrown$,
      changeEntity: this.entityChanged$,
      changeList: this.listChanged$,
      reset: this.reset$,
    },
  );

  private createAsyncEntityAdapter() {
    return createAdapter<AsyncState<T>>()({
      sendCommand: (state, payload: any) => ({
        ...state,
        waiting: true,
        error: null,
        commandAccepted: false,
      }),
      acceptCommand: state => ({
        ...state,
        waiting: false,
        error: null,
        commandAccepted: true,
      }),
      throwError: (state, error: Error) => ({
        ...state,
        error,
        commandAccepted: false,
        waiting: false,
        entity: null,
        list: [],
      }),
      changeEntity: (state, entity: T) => ({
        ...state,
        entity,
      }),
      changeList: (state, list: T[]) => ({
        ...state,
        list,
      }),
      reset: (state, paylod: any, initialState) => initialState,
      selectors: {
        getEntity: state => state.entity,
        getList: state => state.list,
        getWaiting: state => state.waiting,
        getError: state => state.error,
        getCommandAccepted: state => state.commandAccepted,
      },
    });
  }
}
