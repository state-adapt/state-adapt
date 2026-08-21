import { Component, computed, inject, model } from '@angular/core';
import { adapt } from '@state-adapt/angular';

import { createRecruit } from '../crew.adapter';
import { CrewStores, onRecruit } from '../crew.store';
import { crewFilters, CrewFilter, CrewSort } from '../crew.types';

@Component({
  standalone: true,
  selector: 'sa-crew-controls',
  template: `
    <section class="panel crew-controls">
      <form
        class="field-row recruit-form"
        (submit)="
          $event.preventDefault(); draft().trim() && onRecruit(createRecruit(draft()))
        "
      >
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
          @for (chip of filterChips(); track chip.value) {
            <button
              class="chip"
              [class.active]="filter() === chip.value"
              [attr.data-testid]="'crew-filter-' + chip.value"
              [attr.aria-pressed]="filter() === chip.value"
              (click)="filter.set(chip.value)"
            >
              {{ chip.value }}
              <span class="chip-count">{{ chip.count }}</span>
            </button>
          }
        </div>

        <label class="sort-control">
          <span>Sort by</span>
          <select
            data-testid="crew-sort"
            [value]="sort()"
            (change)="sort.set($any($event.target).value)"
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
  filter = model.required<CrewFilter>();
  sort = model.required<CrewSort>();

  onRecruit = onRecruit;
  createRecruit = createRecruit;
  crew = inject(CrewStores).crew;
  draft = adapt('', {
    sources: { reset: onRecruit },
  });

  /** Each chip's count comes from a generated entity selector, derived once per change. */
  filterChips = computed(() =>
    crewFilters.map(value => ({
      value,
      count: value === 'all' ? this.crew.count() : this.crew[`${value}Count`](),
    })),
  );

  // Angular templates have no object spread, so the upsert payload is built here.
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
