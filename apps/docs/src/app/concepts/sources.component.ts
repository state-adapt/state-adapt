import { Component } from '@angular/core';
import md from 'raw-loader!./sources.md';

@Component({
  selector: 'state-adapt-sources',
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
    </state-adapt-content>
  `,
})
export class SourcesComponent {
  md = md;
}
