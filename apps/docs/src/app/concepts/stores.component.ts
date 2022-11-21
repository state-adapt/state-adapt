import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./stores.md';
import { ContentComponent } from '../content.component';

@Component({
  standalone: true,
  selector: 'sa-stores',
  imports: [RouterModule, ContentComponent, MarkdownModule],
  template: `
    <sa-content>
      <markdown [data]="md"></markdown>
      <h2>
        <a routerLink="/concepts/thinking-reactively"
          >Next: Thinking Reactively</a
        >
      </h2>
      <h2><a routerLink="/concepts/adapters">Previous: Adapters</a></h2>
    </sa-content>
  `,
  styles: [
    `
      ::ng-deep state-adapt-stores img {
        max-width: 100%;
      }
    `,
  ],
})
export class StoresComponent {
  md = md;
}
