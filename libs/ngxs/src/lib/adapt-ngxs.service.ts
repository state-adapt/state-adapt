import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { AdaptCommon } from '@state-adapt/rxjs';

@Injectable({ providedIn: 'root' })
export class AdaptNgxs extends AdaptCommon<Store> {
  constructor(private store: Store) {
    super(store);
  }
}
