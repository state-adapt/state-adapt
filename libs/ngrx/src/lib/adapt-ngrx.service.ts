import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Adapt } from '@state-adapt/rxjs';

@Injectable({ providedIn: 'root' })
export class AdaptNgrx extends Adapt<Store> {
  constructor(private store: Store) {
    super(store);
  }
}
