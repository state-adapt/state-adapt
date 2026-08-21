import { Component, computed, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'sa-counter-card',
  template: `
    <section class="card static" [attr.data-testid]="testId()">
      <h2>Counter {{ name() }}</h2>
      <p
        class="stat"
        [class.negative]="store().isNegative()"
        [attr.data-testid]="testId() + '-value'"
      >{{ count() }}</p>
      <p class="muted small">
        Selector says it's
        <strong [attr.data-testid]="testId() + '-parity'">{{ store().parity() }}</strong>
      </p>
      <div class="button-row">
        <button
          [attr.data-testid]="testId() + '-decrement'"
          (click)="store().decrement(step())"
        >
          −{{ step() }}
        </button>
        <button
          [attr.data-testid]="testId() + '-increment'"
          (click)="store().increment(step())"
        >
          +{{ step() }}
        </button>
        <button [attr.data-testid]="testId() + '-double'" (click)="store().double()">
          ×2
        </button>
        <button [attr.data-testid]="testId() + '-negate'" (click)="store().negate()">
          ±
        </button>
        <button
          class="ghost"
          [attr.data-testid]="testId() + '-reset'"
          (click)="store().reset()"
        >
          Reset
        </button>
      </div>
    </section>
  `,
})
export class CounterCardComponent {
  name = input.required<string>();
  testId = input.required<string>();
  step = input.required<number>();
  store = input.required<CounterStore>();

  // The store is itself a signal of its state, so the count is one read away.
  count = computed(() => this.store()());
}

type CounterStore = {
  (): number;
  increment: (step: number) => void;
  decrement: (step: number) => void;
  double: () => void;
  negate: () => void;
  reset: () => void;
  parity: () => string;
  isNegative: () => boolean;
};
