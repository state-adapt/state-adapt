import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { StateAdapt } from '../../../../libs/rxjs/src';

@Injectable({ providedIn: 'root' })
export class AdaptNgxs extends StateAdapt<Store> {
  constructor(private store: Store) {
    super(store);
  }
}
