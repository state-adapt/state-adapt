import { Component, inject } from '@angular/core';
import { adapt } from '@state-adapt/angular';

import { CrewMember } from '../crew.adapter';
import { CrewStores } from '../crew.store';
import { CrewFilter, CrewSort, CrewViewSelector } from '../crew.types';
import { capitalize } from '../crew.view';
import { CrewControlsComponent } from './crew-controls';
import { CrewHeroComponent } from './crew-hero';
import { CrewListComponent } from './crew-list';

@Component({
  standalone: true,
  selector: 'sa-crew-roster',
  imports: [CrewHeroComponent, CrewControlsComponent, CrewListComponent],
  template: `
    <sa-crew-hero />
    <sa-crew-controls
      [filter]="filter()"
      [sort]="sort()"
      (filterChange)="filter.set($event)"
      (sortChange)="sort.set($event)"
    />
    <sa-crew-list [visible]="visible" [filter]="filter()" />
  `,
})
export class CrewRosterComponent {
  crew = inject(CrewStores).store;
  filter = adapt('all' as CrewFilter);
  sort = adapt('name' as CrewSort);

  get visible(): CrewMember[] {
    const viewSelector = `${this.filter()}By${capitalize(
      this.sort(),
    )}` as CrewViewSelector;
    return (this.crew as unknown as Record<CrewViewSelector, () => CrewMember[]>)[
      viewSelector
    ]();
  }
}
