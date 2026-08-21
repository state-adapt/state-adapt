import { Component, computed, inject } from '@angular/core';
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
      (filterChange)="filter.set($event)"
      [sort]="sort()"
      (sortChange)="sort.set($event)"
    />
    <sa-crew-list [visible]="visibleMembers()" [filter]="filter()" />
  `,
})
export class CrewRosterComponent {
  crew = inject(CrewStores).crew;
  filter = adapt('all' as CrewFilter);
  sort = adapt('name' as CrewSort);

  /** The filter and the sort pick which generated entity selector to read. */
  visibleMembers = computed(() => {
    const viewSelector = `${this.filter()}By${capitalize(
      this.sort(),
    )}` as CrewViewSelector;
    return this.crew[viewSelector]();
  });
}
