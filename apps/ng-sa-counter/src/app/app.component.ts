import { Component } from '@angular/core';
import { AdaptCommon, Source } from '@state-adapt/core';
import { countAdapter } from './count.adapter';

@Component({
  selector: 'state-adapt-root',
  template: `
    <state-adapt-counter
      (increment)="store1.increment($event)"
      (double)="store1.double()"
      (resetCount)="store1.reset(0)"
      [count]="store1.state$ | async"
    ></state-adapt-counter>

    <state-adapt-counter
      (increment)="store2.increment($event)"
      (double)="store2.double()"
      (resetCount)="store2.reset(0)"
      [count]="store2.state$ | async"
    ></state-adapt-counter>

    <state-adapt-reset-both (resetBoth)="resetBoth$.next()"></state-adapt-reset-both>
  `,
})
export class AppComponent {
  resetBoth$ = new Source<void>('[counts] resetBoth$');

  store1 = this.adapt.init(['count1', countAdapter, 0], {
    reset: this.resetBoth$,
  });
  store2 = this.adapt.init(['count2', countAdapter, 0], {
    reset: this.resetBoth$,
  });

  constructor(private adapt: AdaptCommon) {
    this.store1.double();
  }
}
