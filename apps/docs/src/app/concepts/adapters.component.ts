import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./adapters.md';
import { ContentComponent } from '../content.component';

@Component({
  standalone: true,
  selector: 'sa-adapters',
  imports: [RouterModule, ContentComponent, MarkdownModule],
  template: `
    <sa-content>
      <markdown [data]="md"></markdown>
      <h2><a routerLink="/concepts/stores">Next: Stores</a></h2>
      <h2><a routerLink="/concepts/sources">Previous: Sources</a></h2>
    </sa-content>
  `,
})
export class AdaptersComponent {
  md = md;
}
