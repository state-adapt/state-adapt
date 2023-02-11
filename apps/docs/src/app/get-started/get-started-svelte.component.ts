import { Component } from '@angular/core';
import { HtmlComponent } from '@state-adapt/adapter-docs';

import { ContentComponent } from '../content.component';
import html from './get-started-svelte.md';

@Component({
  standalone: true,
  selector: 'sa-get-started-svelte',
  imports: [ContentComponent, HtmlComponent],
  template: `
    <sa-content>
      <sa-html [html]="html"></sa-html>
    </sa-content>
  `,
})
export class GetStartedSvelteComponent {
  html = html;
}
