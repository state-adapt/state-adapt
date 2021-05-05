import { Component } from '@angular/core';
import md from 'raw-loader!./demos.md';

@Component({
  selector: 'state-adapt-demos',
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
    </state-adapt-content>
  `,
})
export class DemosComponent {
  md = md;
}
