import { Component } from '@angular/core';
import md from 'raw-loader!./overview.md';

@Component({
  selector: 'state-adapt-concepts-overview',
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
    </state-adapt-content>
  `,
})
export class ConceptsOverviewComponent {
  md = md;
}
