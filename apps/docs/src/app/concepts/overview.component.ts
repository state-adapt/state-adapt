import { Component } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./overview.md';
import { ContentComponent } from '../content.component';
import { NavTileComponent } from './nav-tile.component';

@Component({
  standalone: true,
  selector: 'state-adapt-concepts-overview',
  imports: [ContentComponent, MarkdownModule, NavTileComponent],
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
      <state-adapt-nav-tile [right]="true" link="/concepts/sources">
        Sources
      </state-adapt-nav-tile>
    </state-adapt-content>
  `,
})
export class ConceptsOverviewComponent {
  md = md;
}
