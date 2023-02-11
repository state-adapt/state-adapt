import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { StateAdapt } from '@state-adapt/rxjs';

@Injectable({ providedIn: 'root' })
export class AdaptNgrx extends StateAdapt<Store> {
  constructor(private store: Store) {
    super(store);
  }
}
