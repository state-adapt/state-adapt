import { Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'sa-crew-stat',
  template: `
    <div>
      <strong [attr.data-testid]="testId()">{{ value() }}</strong>
      <span>{{ label() }}</span>
    </div>
  `,
})
export class CrewStatComponent {
  label = input.required<string>();
  value = input.required<number>();
  testId = input.required<string>();
}
