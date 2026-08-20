import { Component, inject } from '@angular/core';

import { CrewStores } from '../crew.store';
import { CrewStatComponent } from './crew-stat';

@Component({
  standalone: true,
  selector: 'sa-crew-hero',
  imports: [CrewStatComponent],
  template: `
    <section class="panel crew-hero">
      <div>
        <p class="eyebrow">Entity adapter showcase</p>
        <h1>Flight Operations</h1>
        <p class="muted">
          One normalized roster powers this dashboard, its filtered views, bulk commands,
          and every detail page.
        </p>
      </div>
      <div class="crew-stats" aria-label="Roster statistics">
        <sa-crew-stat label="Roster" [value]="crew.count()" testId="crew-count" />
        <sa-crew-stat
          label="Active"
          [value]="crew.activeCount()"
          testId="crew-active-count"
        />
        <sa-crew-stat
          label="Flight ready"
          [value]="crew.availableCount()"
          testId="crew-available-count"
        />
        <sa-crew-stat
          label="Selected"
          [value]="crew.selectedCount()"
          testId="crew-selected-count"
        />
      </div>
    </section>
  `,
})
export class CrewHeroComponent {
  crew = inject(CrewStores).store;
}
