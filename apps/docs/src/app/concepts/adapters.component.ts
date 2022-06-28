import { Component } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./adapters.md';
import { ContentComponent } from '../content.component';
import { NavTileComponent } from './nav-tile.component';

@Component({
  standalone: true,
  selector: 'state-adapt-adapters',
  imports: [ContentComponent, MarkdownModule, NavTileComponent],
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
      <state-adapt-nav-tile link="/concepts/sources">Sources</state-adapt-nav-tile>
      <state-adapt-nav-tile [right]="true" link="/concepts/stores">
        Stores
      </state-adapt-nav-tile>
    </state-adapt-content>
  `,
})
export class AdaptersComponent {
  md = md;
}
