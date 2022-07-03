import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./adapters.md';
import { ContentComponent } from '../content.component';

@Component({
  standalone: true,
  selector: 'state-adapt-adapters',
  imports: [RouterModule, ContentComponent, MarkdownModule],
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
      <h2><a routerLink="/concepts/stores">Next: Stores</a></h2>
      <h2><a routerLink="/concepts/sources">Previous: Sources</a></h2>
    </state-adapt-content>
  `,
})
export class AdaptersComponent {
  md = md;
}
