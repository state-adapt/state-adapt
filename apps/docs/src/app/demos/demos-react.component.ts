import { Component } from '@angular/core';
import { HtmlComponent } from '@state-adapt/adapter-docs';

import { ContentComponent } from '../content.component';
import html from './demos-react.md';

@Component({
  standalone: true,
  selector: 'sa-demos-react',
  imports: [ContentComponent, HtmlComponent],
  template: `
    <sa-content>
      <sa-html [html]="html"></sa-html>
    </sa-content>
  `,
})
export class DemosReactComponent {
  html = html;
}
