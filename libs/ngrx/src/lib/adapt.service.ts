import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AdaptCommon } from '@state-adapt/core';

@Injectable({ providedIn: 'root' })
export class Adapt extends AdaptCommon<Store> {
  constructor(private store: Store) {
    super(store);
  }
}
