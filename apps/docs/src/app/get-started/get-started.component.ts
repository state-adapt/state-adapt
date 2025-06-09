import { Component } from '@angular/core';
import { HtmlComponent } from '@state-adapt/adapter-docs';

import { ContentComponent } from '../content.component';
import html from './get-started.md';

@Component({
  standalone: true,
  selector: 'sa-get-started',
  imports: [ContentComponent, HtmlComponent],
  providers: [{ provide: 'framework', useValue: 'angular' }],
  template: `<sa-content><sa-html [html]="html"></sa-html></sa-content>`,
  styles: [
    `
      ::ng-deep sa-get-started img {
        width: 50px;
        vertical-align: middle;
      }
    `,
  ],
})
export class GetStartedComponent {
  html = html;
}
