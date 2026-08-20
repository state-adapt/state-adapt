import { Component, Input } from '@angular/core';

import { CrewMember } from '../crew.adapter';
import { CrewFilter } from '../crew.types';
import { CrewCardComponent } from './crew-card';

@Component({
  standalone: true,
  selector: 'sa-crew-list',
  imports: [CrewCardComponent],
  template: `
    <section class="crew-list" data-testid="crew-list">
      @for (member of visible; track member.callSign) {
        <sa-crew-card [member]="member" />
      }
      @if (!visible.length) {
        <p class="panel muted empty" data-testid="crew-empty">
          No crew match the <strong>{{ filter }}</strong> view.
        </p>
      }
    </section>
  `,
})
export class CrewListComponent {
  @Input({ required: true }) visible!: CrewMember[];
  @Input({ required: true }) filter!: CrewFilter;
}
