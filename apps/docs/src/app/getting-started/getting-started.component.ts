import { Component } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./getting-started.md';
import { ContentComponent } from '../content.component';

@Component({
  standalone: true,
  selector: 'sa-getting-started',
  imports: [ContentComponent, MarkdownModule],
  template: `
    <sa-content>
      <markdown [data]="md"></markdown>
    </sa-content>
  `,
})
export class GettingStartedComponent {
  md = md;
}
