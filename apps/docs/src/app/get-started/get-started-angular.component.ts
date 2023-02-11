import { Component } from '@angular/core';
import { HtmlComponent } from '@state-adapt/adapter-docs';

import { ContentComponent } from '../content.component';
import html from './get-started-angular.md';

@Component({
  standalone: true,
  selector: 'sa-get-started-angular',
  imports: [ContentComponent, HtmlComponent],
  providers: [{ provide: 'framework', useValue: 'angular' }],
  template: `<sa-content><sa-html [html]="html"></sa-html></sa-content>`,
})
export class GetStartedAngularComponent {
  html = html;
}
