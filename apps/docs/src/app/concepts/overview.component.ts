import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HtmlComponent } from '@state-adapt/adapter-docs';

import { ContentComponent } from '../content.component';
import html from './overview.md';

@Component({
  standalone: true,
  selector: 'sa-concepts-overview',
  imports: [RouterModule, ContentComponent, HtmlComponent],
  template: `
    <sa-content>
      <sa-html [html]="html"></sa-html>
      <h2><a routerLink="/concepts/sources">Next: Sources</a></h2>
    </sa-content>
  `,
})
export class ConceptsOverviewComponent {
  html = html;
}
