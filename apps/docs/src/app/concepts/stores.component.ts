import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HtmlComponent } from '@state-adapt/adapter-docs';

import { ContentComponent } from '../content.component';
import html from './stores.md';

@Component({
  standalone: true,
  selector: 'sa-stores',
  imports: [RouterModule, ContentComponent, HtmlComponent],
  template: `
    <sa-content>
      <sa-html [html]="html"></sa-html>
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
  html = html;
}
