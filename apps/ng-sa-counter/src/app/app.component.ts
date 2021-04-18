import { Component } from '@angular/core';
import { AdaptCommon, Source } from '@state-adapt/core';
import { countAdapter } from './count.adapter';

@Component({
  selector: 'state-adapt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  increment$ = new Source<number>('increment$');
  double$ = new Source<void>('double$');
  reset$ = new Source<void>('reset$');
  store = this.adapt.init(['count', countAdapter, 0], {
    increment: this.increment$,
    double: this.double$,
    reset: this.reset$,
  });
  count$ = this.store.getState();

  constructor(private adapt: AdaptCommon<any>) {}
}
