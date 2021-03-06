import { Component } from '@angular/core';
import md from 'raw-loader!./overview.md';

@Component({
  selector: 'state-adapt-concepts-overview',
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
      <state-adapt-nav-tile [right]="true" link="/concepts/sources">
        Sources
      </state-adapt-nav-tile>
    </state-adapt-content>
  `,
})
export class ConceptsOverviewComponent {
  md = md;
}
