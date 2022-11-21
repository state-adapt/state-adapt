import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./sources.md';
import { ContentComponent } from '../content.component';

@Component({
  standalone: true,
  selector: 'sa-sources',
  imports: [RouterModule, ContentComponent, MarkdownModule],
  template: `
    <sa-content>
      <markdown [data]="md"></markdown>
      <h2><a routerLink="/concepts/adapters">Next: Adapters</a></h2>
      <h2><a routerLink="/concepts/overview">Previous: Overview</a></h2>
    </sa-content>
  `,
})
export class SourcesComponent {
  md = md;
}
