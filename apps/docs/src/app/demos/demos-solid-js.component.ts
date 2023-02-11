import { Component } from '@angular/core';
import { HtmlComponent } from '@state-adapt/adapter-docs';

import { ContentComponent } from '../content.component';
import html from './demos-solid-js.md';

@Component({
  standalone: true,
  selector: 'sa-demos-solid-js',
  imports: [ContentComponent, HtmlComponent],
  template: `
    <sa-content>
      <sa-html [html]="html"></sa-html>
    </sa-content>
  `,
})
export class DemosSolidJsComponent {
  html = html;
}
