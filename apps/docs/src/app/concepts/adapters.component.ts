import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HtmlComponent } from '@state-adapt/adapter-docs';

import { ContentComponent } from '../content.component';
import html from './adapters.md';

@Component({
  standalone: true,
  selector: 'sa-adapters',
  imports: [RouterModule, ContentComponent, HtmlComponent],
  template: `
    <sa-content>
      <sa-html [html]="html"></sa-html>
      <h2><a routerLink="/concepts/stores">Next: Stores</a></h2>
      <h2><a routerLink="/concepts/sources">Previous: Sources</a></h2>
    </sa-content>
  `,
})
export class AdaptersComponent {
  html = html;
}
