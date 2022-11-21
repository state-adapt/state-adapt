import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./thinking-reactively.md';
import { ContentComponent } from '../content.component';

@Component({
  standalone: true,
  selector: 'sa-thinking-reactively',
  imports: [RouterModule, ContentComponent, MarkdownModule],
  template: `
    <sa-content>
      <markdown [data]="md"></markdown>
      <h2><a routerLink="/concepts/stores">Previous: Stores</a></h2>
    </sa-content>
  `,
})
export class ThinkingReactivelyComponent {
  md = md;
}
