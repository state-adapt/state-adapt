import { Component } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./stores.md';
import { ContentComponent } from '../content.component';
import { NavTileComponent } from './nav-tile.component';

@Component({
  standalone: true,
  selector: 'state-adapt-stores',
  imports: [ContentComponent, MarkdownModule, NavTileComponent],
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
      <state-adapt-nav-tile link="/concepts/adapters">Adapters</state-adapt-nav-tile>
      <state-adapt-nav-tile [right]="true" link="/concepts/thinking-reactively">
        Thinking Reactively
      </state-adapt-nav-tile>
    </state-adapt-content>
  `,
})
export class StoresComponent {
  md = md;
}
