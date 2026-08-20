import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { adapt } from '@state-adapt/angular';

import { createRecruit } from '../crew.adapter';
import { CrewStores, onRecruit } from '../crew.store';
import { crewFilters, CrewFilter, CrewSort } from '../crew.types';

@Component({
  standalone: true,
  selector: 'sa-crew-controls',
  template: `
    <section class="panel crew-controls">
      <form class="field-row recruit-form" (submit)="onSubmit($event)">
        <input
          aria-label="Recruit name"
          data-testid="crew-recruit-input"
          placeholder="Recruit a mission candidate"
          [value]="draft()"
          (input)="draft.set($any($event.target).value)"
        />
        <button class="button primary" data-testid="crew-recruit" type="submit">
          Add recruit
        </button>
      </form>

      <div class="crew-toolbar">
        <div class="filter-group" role="group" aria-label="Filter crew">
          @for (value of crewFilters; track value) {
            <button
              class="chip"
              [class.active]="filter === value"
              [attr.data-testid]="'crew-filter-' + value"
              [attr.aria-pressed]="filter === value"
              (click)="filterChange.emit(value)"
            >
              {{ value }}
              <span class="chip-count">{{
                value === 'all' ? crew.count() : countFor(value)
              }}</span>
            </button>
          }
        </div>

        <label class="sort-control">
          <span>Sort by</span>
          <select
            data-testid="crew-sort"
            [value]="sort"
            (change)="sortChange.emit($any($event.target).value)"
          >
            <option value="name">Name</option>
            <option value="clearance">Clearance</option>
            <option value="missionsCompleted">Missions</option>
          </select>
        </label>
      </div>

      <div class="crew-bulk row">
        <p class="muted small">
          Generated reactions target one entity, every entity, or only a filtered set.
        </p>
        <div class="button-row">
          <button
            class="ghost"
            data-testid="crew-toggle-all"
            (click)="crew.setAllSelected(!crew.allAreSelected())"
          >
            {{ crew.allAreSelected() ? 'Clear selection' : 'Select all' }}
          </button>
          <button
            class="ghost"
            data-testid="crew-award-selected"
            [disabled]="!crew.selectedCount()"
            (click)="crew.awardSelected(1)"
          >
            Raise clearance
          </button>
          <button class="ghost" data-testid="crew-sync" (click)="syncDispatch()">
            Sync dispatch
          </button>
          <button class="ghost danger" (click)="crew.reset()">Reset roster</button>
        </div>
      </div>
    </section>
  `,
})
export class CrewControlsComponent {
  @Input({ required: true }) filter!: CrewFilter;
  @Input({ required: true }) sort!: CrewSort;
  @Output() filterChange = new EventEmitter<CrewFilter>();
  @Output() sortChange = new EventEmitter<CrewSort>();

  crewFilters = crewFilters;
  crew = inject(CrewStores).store;
  draft = adapt('', {
    sources: { reset: onRecruit },
  });

  countFor(value: Exclude<CrewFilter, 'all'>) {
    return this.crew[`${value}Count`]();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.draft().trim() && onRecruit(createRecruit(this.draft()));
  }

  syncDispatch() {
    this.crew.upsertMany([
      { ...this.crew.entities()['lumen-4'], status: 'active' },
      {
        callSign: 'vector-8',
        name: 'Sana Idris',
        role: 'Navigation specialist',
        status: 'active',
        clearance: 4,
        missionsCompleted: 22,
        selected: false,
      },
    ]);
  }
}
