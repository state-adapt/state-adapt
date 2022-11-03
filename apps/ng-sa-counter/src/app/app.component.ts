import { Component } from '@angular/core';
import { buildAdapter, joinAdapters } from '@state-adapt/core';
// import { buildAdapter } from '@state-adapt/core';
import { AdaptCommon, Source, toSource } from '@state-adapt/rxjs';
import { interval } from 'rxjs';
import { countAdapter } from './count.adapter';

interface JoinedCounters {
  a: number;
  b: number;
}

interface MegaCounter {
  m: JoinedCounters;
}

const initialMegaCounter: MegaCounter = {
  m: {
    a: 0,
    b: 0,
  },
};

@Component({
  selector: 'state-adapt-root',
  template: `
    <!-- <h2>Store 1</h2>
    <state-adapt-counter
      (increment)="store1.set($event)"
      (resetCount)="store1.reset()"
      [count]="store1.state$ | async"
    ></state-adapt-counter>

    <h2>Store 2</h2>
    <p>{{ store2.state$ | async }}</p>

    <h2>Store 3</h2>
    <state-adapt-counter
      (increment)="store3.increment($event)"
      (double)="store3.double()"
      (resetCount)="store3.reset()"
      [count]="store3.state$ | async"
    ></state-adapt-counter>

    <h2>Store 4</h2>
    <state-adapt-counter
      (increment)="store4.multiply($event)"
      (resetCount)="store4.reset()"
      [count]="store4.state$ | async"
    ></state-adapt-counter>

    <h2>Store 5</h2>
    {{ store5.mAS$ | async }}
    <state-adapt-counter
      (increment)="store5.incrementMA($event)"
      (double)="store5.doubleMA()"
      (resetCount)="store5.reset()"
      [count]="store5.mA$ | async"
    ></state-adapt-counter>

    <h2>Store 6</h2>
    <state-adapt-counter
      (increment)="store6.increment($event)"
      (double)="store6.double()"
      (resetCount)="store6.reset()"
      [count]="store6.state$ | async"
    ></state-adapt-counter>

    <h2>Reset Action</h2>
    <state-adapt-reset-both (resetBoth)="resetBoth$.next()"></state-adapt-reset-both> -->
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
  // interval$ = interval(3000).pipe(toSource('[counts] interval$'));
  // resetBoth$ = new Source<void>('[counts] resetBoth$');

  // joinedNumbersAdapter = joinAdapters<JoinedCounters>()({
  //   a: countAdapter,
  //   b: countAdapter,
  // })();

  // megaAdapter = joinAdapters<MegaCounter>()({
  //   m: this.joinedNumbersAdapter,
  // })();

  // store1 = this.adapt.init('count1', 0);
  // store2 = this.adapt.init(['count2', 0], this.interval$);
  // store3 = this.adapt.init(['count3', 0], countAdapter);
  // store4 = this.adapt.init(['count4', 10], {
  //   multiply: (state, n: number) => state * n,
  // });
  // store5 = this.adapt.init(['count5', initialMegaCounter, this.megaAdapter], {
  //   setMA: this.interval$,
  // });
  // store6 = this.adapt.init(['count6', 0, countAdapter], {
  //   set: this.interval$,
  //   reset: this.resetBoth$,
  // });

  numberAdapter = buildAdapter<number>()({
    double: state => state * 2,
    selectors: {
      double: s => s * 2,
    },
  })({ quadruple: s => s.double * 2 })();

  a = this.numberAdapter.selectors.quadruple;

  numbersAdapter = joinAdapters<{ a: number; b: number }>()({
    a: this.numberAdapter,
    b: this.numberAdapter,
  })({
    rando: s => s.state,
  })();

  b = this.numbersAdapter.selectors;

  interval7$ = interval(7000).pipe(toSource('interval7$'));
  interval3$ = interval(3000).pipe(toSource('interval3$'));

  numbersA = this.adapt.init(['numberA', { a: 5, b: 5 }, this.numbersAdapter], {
    doubleA: this.interval7$,
    doubleB: this.interval3$,
  });

  // numbersB = this.adapt.init(['numberB', { a: 7, b: 7 }], this.numbersAdapter);

  sub5 = this.numbersA.aQuadruple$.subscribe(s => console.log('numbersA.quadrupleB$', s));
  // sub7 = this.numbersB.quadrupleB$.subscribe(s => console.log('numbersB.quadrupleB$', s));
  m5 = this.numbersA.set({ a: 4, b: 4 });

  constructor(private adapt: AdaptCommon) {
    // this.store1.set();
    // this.store2.set();
    // this.store3.double(4);
    // this.store4.multiply('4');
    // this.store5.set('4');
    // this.store6.increment();
  }
}
