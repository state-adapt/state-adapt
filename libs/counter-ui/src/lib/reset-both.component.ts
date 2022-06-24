import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'state-adapt-reset-both',
  template: `
    <div style="width: 500px; margin: 100px auto">
      <button ibmButton="primary" (click)="resetBoth.next()">Reset Both</button>
    </div>
  `,
})
export class ResetBothComponent {
  @Output() resetBoth = new EventEmitter<void>();
}