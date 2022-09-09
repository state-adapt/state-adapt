import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AdaptCommon } from '@state-adapt/rxjs';

@Injectable({ providedIn: 'root' })
export class AdaptNgrx extends AdaptCommon<Store> {
  constructor(private store: Store) {
    super(store);
  }
}
