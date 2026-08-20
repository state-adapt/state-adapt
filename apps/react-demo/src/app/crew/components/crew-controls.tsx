import React from 'react';
import { useAdapt, useStore } from '@state-adapt/react';

import { createRecruit } from '../crew.adapter';
import { crewStore, onRecruit } from '../crew.store';
import { crewFilters, CrewFilter, CrewSort } from '../crew.types';

export function CrewControls({
  filter,
  setFilter,
  sort,
  setSort,
}: {
  filter: CrewFilter;
  setFilter: (filter: CrewFilter) => void;
  sort: CrewSort;
  setSort: (sort: CrewSort) => void;
}) {
  const [crew, setCrew] = useStore(crewStore);
  const [draft, setDraft] = useAdapt('', {
    sources: { reset: onRecruit },
  });

  return (
    <section className="panel crew-controls">
      <form
        className="field-row recruit-form"
        onSubmit={event => {
          event.preventDefault();
          draft.state.trim() && onRecruit(createRecruit(draft.state));
        }}
      >
        <input
          aria-label="Recruit name"
          data-testid="crew-recruit-input"
          placeholder="Recruit a mission candidate"
          value={draft.state}
          onChange={event => setDraft(event.target.value)}
        />
        <button className="button primary" data-testid="crew-recruit" type="submit">
          Add recruit
        </button>
      </form>

      <div className="crew-toolbar">
        <div className="filter-group" role="group" aria-label="Filter crew">
          {crewFilters.map(value => (
            <button
              className={`chip ${filter === value ? 'active' : ''}`}
              data-testid={`crew-filter-${value}`}
              aria-pressed={filter === value}
              key={value}
              onClick={() => setFilter(value)}
            >
              {value}
              <span className="chip-count">
                {value === 'all' ? crew.count : crew[`${value}Count`]}
              </span>
            </button>
          ))}
        </div>

        <label className="sort-control">
          <span>Sort by</span>
          <select
            data-testid="crew-sort"
            value={sort}
            onChange={event => setSort(event.target.value as CrewSort)}
          >
            <option value="name">Name</option>
            <option value="clearance">Clearance</option>
            <option value="missionsCompleted">Missions</option>
          </select>
        </label>
      </div>

      <div className="crew-bulk row">
        <p className="muted small">
          Generated reactions target one entity, every entity, or only a filtered set.
        </p>
        <div className="button-row">
          <button
            className="ghost"
            data-testid="crew-toggle-all"
            onClick={() => setCrew.setAllSelected(!crew.allAreSelected)}
          >
            {crew.allAreSelected ? 'Clear selection' : 'Select all'}
          </button>
          <button
            className="ghost"
            data-testid="crew-award-selected"
            disabled={!crew.selectedCount}
            onClick={() => setCrew.awardSelected(1)}
          >
            Raise clearance
          </button>
          <button
            className="ghost"
            data-testid="crew-sync"
            onClick={() =>
              setCrew.upsertMany([
                { ...crew.entities['lumen-4'], status: 'active' },
                {
                  callSign: 'vector-8',
                  name: 'Sana Idris',
                  role: 'Navigation specialist',
                  status: 'active',
                  clearance: 4,
                  missionsCompleted: 22,
                  selected: false,
                },
              ])
            }
          >
            Sync dispatch
          </button>
          <button className="ghost danger" onClick={() => setCrew.reset()}>
            Reset roster
          </button>
        </div>
      </div>
    </section>
  );
}
