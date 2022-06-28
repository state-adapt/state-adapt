import { Component } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./sources.md';
import { ContentComponent } from '../content.component';
import { NavTileComponent } from './nav-tile.component';

@Component({
  standalone: true,
  selector: 'state-adapt-sources',
  imports: [ContentComponent, MarkdownModule, NavTileComponent],
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
      <state-adapt-nav-tile link="/concepts/overview">Overview</state-adapt-nav-tile>
      <state-adapt-nav-tile [right]="true" link="/concepts/adapters">
        Adapters
      </state-adapt-nav-tile>
    </state-adapt-content>
  `,
})
export class SourcesComponent {
  md = md;
}
