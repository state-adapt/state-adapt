import { Component } from '@angular/core';
import { adaptNgxs } from '@state-adapt/ngxs';
import { source } from '@state-adapt/rxjs';
import { countAdapter } from './count.adapter';

@Component({
  selector: 'sa-root',
  template: `
    <sa-counter
      (increment)="store1.increment($event)"
      (double)="store1.double()"
      (resetCount)="store1.reset()"
      [count]="store1.state$ | async"
    ></sa-counter>

    <sa-counter
      (increment)="store2.increment($event)"
      (double)="store2.double()"
      (resetCount)="store2.reset()"
      [count]="store2.state$ | async"
    ></sa-counter>

    <sa-reset-both (resetBoth)="resetBoth$.next()"></sa-reset-both>
  `,
})
export class AppComponent {
  resetBoth$ = source('[counts] resetBoth$');

  store1 = adaptNgxs(0, {
    adapter: countAdapter,
    sources: { reset: this.resetBoth$ },
  });
  store2 = adaptNgxs(0, {
    adapter: countAdapter,
    sources: { reset: this.resetBoth$ },
  });
}
