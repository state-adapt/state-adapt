import { Component } from '@angular/core';
import { HtmlComponent } from '@state-adapt/adapter-docs';

import { ContentComponent } from '../content.component';
import html from './docs-rxjs.md';

@Component({
  standalone: true,
  selector: 'sa-docs-rxjs',
  imports: [ContentComponent, HtmlComponent],
  template: `
    <sa-content>
      <sa-html [html]="html"></sa-html>
    </sa-content>
  `,
})
export class DocsRxjsComponent {
  html = html;
}
