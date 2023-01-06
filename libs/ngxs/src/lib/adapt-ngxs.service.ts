import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Adapt } from '@state-adapt/rxjs';

@Injectable({ providedIn: 'root' })
export class AdaptNgxs extends Adapt<Store> {
  constructor(private store: Store) {
    super(store);
  }
}
