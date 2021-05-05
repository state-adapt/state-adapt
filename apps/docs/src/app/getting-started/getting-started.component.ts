import { Component } from '@angular/core';
import md from 'raw-loader!./getting-started.md';

@Component({
  selector: 'state-adapt-getting-started',
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
    </state-adapt-content>
  `,
})
export class GettingStartedComponent {
  md = md;
}
