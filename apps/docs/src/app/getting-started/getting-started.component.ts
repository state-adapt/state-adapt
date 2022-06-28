import { Component } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./getting-started.md';
import { ContentComponent } from '../content.component';

@Component({
  standalone: true,
  selector: 'state-adapt-getting-started',
  imports: [ContentComponent, MarkdownModule],
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
    </state-adapt-content>
  `,
})
export class GettingStartedComponent {
  md = md;
}
