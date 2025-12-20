import { Injectable } from '@angular/core';
import { adapt } from '@state-adapt/angular';

@Injectable()
export class LocalService {
  store8 = adapt(0);

  constructor() {
    this.store8.set(8); // Errors if not immediately activated
  }
}
