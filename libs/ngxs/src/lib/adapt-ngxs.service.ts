import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { StateAdapt } from '@state-adapt/rxjs';

@Injectable({ providedIn: 'root' })
export class AdaptNgxs extends StateAdapt<Store> {
  constructor(private store: Store) {
    super(store);
  }
}
