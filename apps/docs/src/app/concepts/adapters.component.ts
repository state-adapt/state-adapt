import { Component } from '@angular/core';
import md from 'raw-loader!./adapters.md';

@Component({
  selector: 'state-adapt-adapters',
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
      <state-adapt-nav-tile link="/concepts/sources">
        Sources
      </state-adapt-nav-tile>
      <state-adapt-nav-tile [right]="true" link="/concepts/stores">
        Stores
      </state-adapt-nav-tile>
    </state-adapt-content>
  `,
})
export class AdaptersComponent {
  md = md;
}
