import { Component } from '@angular/core';
import { HtmlComponent } from '@state-adapt/adapter-docs';

import { ContentComponent } from '../content.component';
import html from './docs-angular.md';

@Component({
  standalone: true,
  selector: 'sa-docs-angular',
  imports: [ContentComponent, HtmlComponent],
  template: `
    <sa-content>
      <sa-html [html]="html"></sa-html>
    </sa-content>
  `,
})
export class DocsAngularComponent {
  html = html;
}
