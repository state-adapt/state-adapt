import { Injectable } from '@angular/core';
import { AdaptCommon } from '@state-adapt/core';
import { EntityAsyncAdapter } from './entity-async-adapter';
import { EntityListAsyncAdapter } from './entity-list-async-adapter';

@Injectable({ providedIn: 'root' })
export class AsyncAdapterFactoryService<T> {
  createEntityAsyncAdapter(entityName: string) {
    return new EntityAsyncAdapter<T>(entityName, this.adapt);
  }

  createEntityListAsyncAdapter(entityName: string) {
    return new EntityListAsyncAdapter<T>(entityName, this.adapt);
  }

  constructor(private adapt: AdaptCommon<any>) {}
}
