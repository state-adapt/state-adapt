import { Component } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./thinking-reactively.md';
import { ContentComponent } from '../content.component';
import { NavTileComponent } from './nav-tile.component';

@Component({
  standalone: true,
  selector: 'state-adapt-thinking-reactively',
  imports: [ContentComponent, NavTileComponent, MarkdownModule],
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
      <state-adapt-nav-tile link="/concepts/stores">Stores</state-adapt-nav-tile>
    </state-adapt-content>
  `,
})
export class ThinkingReactivelyComponent {
  md = md;
}
