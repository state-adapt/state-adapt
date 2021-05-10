import { Component } from '@angular/core';
import md from 'raw-loader!./adapters.md';

@Component({
  selector: 'state-adapt-adapters',
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
    </state-adapt-content>
  `,
})
export class AdaptersComponent {
  md = md;
}
