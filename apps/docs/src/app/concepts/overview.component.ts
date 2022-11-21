import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./overview.md';
import { ContentComponent } from '../content.component';

@Component({
  standalone: true,
  selector: 'sa-concepts-overview',
  imports: [RouterModule, ContentComponent, MarkdownModule],
  template: `
    <sa-content>
      <markdown [data]="md"></markdown>
      <h2><a routerLink="/concepts/sources">Next: Sources</a></h2>
    </sa-content>
  `,
})
export class ConceptsOverviewComponent {
  md = md;
}
