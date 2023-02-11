import { Component } from '@angular/core';
import { HtmlComponent } from '@state-adapt/adapter-docs';

import { ContentComponent } from '../content.component';
import html from './get-started-solid-js.md';

@Component({
  standalone: true,
  selector: 'sa-get-started-solid-js',
  imports: [ContentComponent, HtmlComponent],
  template: `
    <sa-content>
      <sa-html [html]="html"></sa-html>
    </sa-content>
  `,
})
export class GetStartedSolidJsComponent {
  html = html;
}
