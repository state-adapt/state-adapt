import { Injectable } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { type } from '@state-adapt/rxjs';
import { interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RootService {
  store7 = adapt(Math.PI, { sources: interval(1000).pipe(type('interval')) });
}
