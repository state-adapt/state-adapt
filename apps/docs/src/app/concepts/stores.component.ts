import { Component } from '@angular/core';
import md from 'raw-loader!./stores.md';

@Component({
  selector: 'state-adapt-stores',
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
      <state-adapt-nav-tile link="/concepts/adapters">
        Adapters
      </state-adapt-nav-tile>
      <state-adapt-nav-tile [right]="true" link="/concepts/thinking-reactively">
        Thinking Reactively
      </state-adapt-nav-tile>
    </state-adapt-content>
  `,
})
export class StoresComponent {
  md = md;
}
