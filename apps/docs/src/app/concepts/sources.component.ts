import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./sources.md';
import { ContentComponent } from '../content.component';

@Component({
  standalone: true,
  selector: 'state-adapt-sources',
  imports: [RouterModule, ContentComponent, MarkdownModule],
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
      <h2><a routerLink="/concepts/adapters">Next: Adapters</a></h2>
      <h2><a routerLink="/concepts/overview">Previous: Overview</a></h2>
    </state-adapt-content>
  `,
})
export class SourcesComponent {
  md = md;
}
