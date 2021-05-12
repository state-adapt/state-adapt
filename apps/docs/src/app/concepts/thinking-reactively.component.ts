import { Component } from '@angular/core';
import md from 'raw-loader!./thinking-reactively.md';

@Component({
  selector: 'state-adapt-thinking-reactively',
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
      <state-adapt-nav-tile link="/concepts/stores">
        Stores
      </state-adapt-nav-tile>
    </state-adapt-content>
  `,
})
export class ThinkingReactivelyComponent {
  md = md;
}
