import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'sa-crew-stat',
  preserveWhitespaces: false,
  template: `
    <div>
      <strong [attr.data-testid]="testId">{{ value }}</strong>
      <span>{{ label }}</span>
    </div>
  `,
})
export class CrewStatComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: number;
  @Input({ required: true }) testId!: string;
}
