import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'sa-counter',
  template: `
    <div style="width: 500px; margin: auto">
      <h1>{{ count }}</h1>
      <p>
        <button ibmButton="primary" (click)="increment.next(3)">Increment by 3</button>
        <button ibmButton="primary" (click)="double.next()">Double</button>
        <button ibmButton="primary" (click)="resetCount.next()">Reset</button>
      </p>
    </div>
  `,
})
export class CounterComponent {
  @Input() count = 0;
  @Output() increment = new EventEmitter<number>();
  @Output() double = new EventEmitter<void>();
  @Output() resetCount = new EventEmitter<void>();
}
