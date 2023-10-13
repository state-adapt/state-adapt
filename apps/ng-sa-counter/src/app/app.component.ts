import { Component, inject } from '@angular/core';
import { Source, toSource } from '@state-adapt/rxjs';
import { interval } from 'rxjs';
import { countAdapter } from './count.adapter';
import { adapt } from '@state-adapt/angular';

@Component({
  selector: 'sa-root',
  template: `
    <h2>Store 1</h2>
    <sa-counter
      (increment)="store1.set($event)"
      (resetCount)="store1.reset()"
      [count]="store1.state$ | async"
    ></sa-counter>

    <h2>Store 2</h2>
    <p>{{ store2.state$ | async }}</p>

    <h2>Store 3</h2>
    <sa-counter
      (increment)="store3.increment($event)"
      (double)="store3.double()"
      (resetCount)="store3.reset()"
      [count]="store3.state$ | async"
    ></sa-counter>

    <h2>Store 4</h2>
    <sa-counter
      (increment)="store4.multiply($event)"
      (resetCount)="store4.reset()"
      [count]="store4.state$ | async"
    ></sa-counter>

    <h2>Store 5</h2>
    <sa-counter
      (increment)="store5.increment($event)"
      (double)="store5.double()"
      (resetCount)="store5.reset()"
      [count]="store5.state$ | async"
    ></sa-counter>

    <h2>Store 6</h2>
    <sa-counter
      (increment)="store6.increment($event)"
      (double)="store6.double()"
      (resetCount)="store6.reset()"
      [count]="store6.state$ | async"
    ></sa-counter>

    <h2>Reset Action</h2>
    <sa-reset-both (resetBoth)="resetBoth$.next()"></sa-reset-both>
  `,
  styles: [
    `
      :host {
        font-family: sans-serif;
      }
      ::ng-deep h1 {
        margin-top: 0 !important;
      }
      h2 {
        width: 500px;
        margin: auto;
      }
    `,
  ],
})
export class AppComponent {
  interval$ = interval(3000).pipe(toSource('[counts] interval$'));
  resetBoth$ = new Source<void>('[counts] resetBoth$');

  store1 = adapt(0, {});
  store2 = adapt(0, { sources: this.interval$ });
  store3 = adapt(0, countAdapter);
  store4 = adapt(10, {
    multiply: (state, n: number) => state * n,
  });
  store5 = adapt(0, { adapter: countAdapter, sources: this.interval$ });
  store6 = adapt(0, {
    adapter: countAdapter,
    sources: {
      set: this.interval$,
      reset: this.resetBoth$,
    },
  });

  doUnreasonableThings() {
    // Should be TS errors
    // @ts-expect-error Should have payload
    this.store1.set();
    // @ts-expect-error Should have payload
    this.store2.set();
    // @ts-expect-error Should not have payload
    this.store3.double(4);
    // @ts-expect-error Payload should be number
    this.store4.multiply('4');
    // @ts-expect-error Payload should be MegaCounter
    this.store5.set('4');
    // @ts-expect-error Should have payload
    this.store6.increment();
  }
}
