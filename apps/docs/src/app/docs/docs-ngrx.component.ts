import { Component } from '@angular/core';
import { HtmlComponent } from '@state-adapt/adapter-docs';

import { ContentComponent } from '../content.component';
import html from './docs-ngrx.md';

@Component({
  standalone: true,
  selector: 'sa-docs-ngrx',
  imports: [ContentComponent, HtmlComponent],
  template: `
    <sa-content>
      <sa-html [html]="html"></sa-html>
    </sa-content>
  `,
})
export class DocsNgrxComponent {
  html = html;
}
