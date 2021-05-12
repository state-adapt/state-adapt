import { Component } from '@angular/core';
import md from 'raw-loader!./sources.md';

@Component({
  selector: 'state-adapt-sources',
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
      <state-adapt-nav-tile link="/concepts/overview">
        Overview
      </state-adapt-nav-tile>
      <state-adapt-nav-tile [right]="true" link="/concepts/adapters">
        Adapters
      </state-adapt-nav-tile>
    </state-adapt-content>
  `,
})
export class SourcesComponent {
  md = md;
}
