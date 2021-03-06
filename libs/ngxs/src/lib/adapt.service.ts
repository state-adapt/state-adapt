import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { AdaptCommon } from '@state-adapt/core';

@Injectable({ providedIn: 'root' })
export class Adapt extends AdaptCommon<Store> {
  constructor(private store: Store) {
    super(store);
  }
}
