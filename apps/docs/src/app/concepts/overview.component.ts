import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./overview.md';
import { ContentComponent } from '../content.component';

@Component({
  standalone: true,
  selector: 'state-adapt-concepts-overview',
  imports: [RouterModule, ContentComponent, MarkdownModule],
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
      <h2><a routerLink="/concepts/sources">Next: Sources</a></h2>
    </state-adapt-content>
  `,
})
export class ConceptsOverviewComponent {
  md = md;
}
