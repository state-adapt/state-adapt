import { Component, Input } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { source } from '@state-adapt/rxjs';

import { LiveTickerComponent } from '../live';
import { counterAdapter } from './counter.adapter';

@Component({
  standalone: true,
  selector: 'sa-counter-card',
  preserveWhitespaces: false,
  template: `
    <section class="card static" [attr.data-testid]="testId">
      <h2>Counter {{ name }}</h2>
      <p
        class="stat"
        [class.negative]="store.isNegative()"
        [attr.data-testid]="testId + '-value'"
      >{{ store() }}</p>
      <p class="muted small">
        Selector says it's
        <strong [attr.data-testid]="testId + '-parity'">{{ store.parity() }}</strong>
      </p>
      <div class="button-row">
        <button [attr.data-testid]="testId + '-decrement'" (click)="store.decrement(step)">
          −{{ step }}
        </button>
        <button [attr.data-testid]="testId + '-increment'" (click)="store.increment(step)">
          +{{ step }}
        </button>
        <button [attr.data-testid]="testId + '-double'" (click)="store.double()">
          ×2
        </button>
        <button [attr.data-testid]="testId + '-negate'" (click)="store.negate()">
          ±
        </button>
        <button
          class="ghost"
          [attr.data-testid]="testId + '-reset'"
          (click)="store.reset()"
        >
          Reset
        </button>
      </div>
    </section>
  `,
})
export class CounterCardComponent {
  @Input({ required: true }) name!: string;
  @Input({ required: true }) testId!: string;
  @Input({ required: true }) step!: number;
  @Input({ required: true }) store!: {
    (): number;
    increment: (step: number) => void;
    decrement: (step: number) => void;
    double: () => void;
    negate: () => void;
    reset: () => void;
    parity: () => string;
    isNegative: () => boolean;
  };
}

@Component({
  standalone: true,
  selector: 'sa-counter-page',
  preserveWhitespaces: false,
  imports: [CounterCardComponent, LiveTickerComponent],
  template: `
    <section class="panel">
      <h1>Counter</h1>
      <p class="muted">
        Both counters share one <code>counterAdapter</code> — the same reactions and
        selectors, two independent stores. The reset button is a
        <code>source</code> both stores react to; no callback wiring between them.
      </p>

      <label class="field narrow">
        <span>Step size</span>
        <input
          type="number"
          data-testid="step-input"
          [value]="step()"
          (input)="step.set($any($event.target).value)"
        />
      </label>
    </section>

    <div class="card-grid">
      <sa-counter-card name="A" testId="counter-a" [store]="a" [step]="stepSize" />
      <sa-counter-card name="B" testId="counter-b" [store]="b" [step]="stepSize" />
    </div>

    <section class="panel">
      <div class="row">
        <div>
          <span class="muted small">Sum of both counters</span>
          <p class="stat" data-testid="counter-sum">{{ a() + b() }}</p>
        </div>
        <button class="button danger" data-testid="reset-all" (click)="onResetAll.next()">
          Reset both
        </button>
      </div>

      <!-- The same store the /live route uses — this route is the second subscriber. -->
      <sa-live-ticker />
    </section>
  `,
})
export class CounterPageComponent {
  // One source, wired into both counters below: a single event, two reactions.
  onResetAll = source<void>('[Counter] onResetAll');

  // The step size is ordinary local state — `adapt` with no adapter behaves
  // much like a writable signal, plus a `reset`. It holds the raw input text so that
  // clearing the field leaves it empty rather than snapping back to 0.
  step = adapt('1');

  a = adapt(0, {
    adapter: counterAdapter,
    sources: { reset: this.onResetAll },
    path: 'counterA',
  });

  b = adapt(10, {
    adapter: counterAdapter,
    sources: { reset: this.onResetAll },
    path: 'counterB',
  });

  get stepSize() {
    return Number(this.step()) || 0;
  }
}
