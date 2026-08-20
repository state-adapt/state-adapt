import React from 'react';
import { useStore } from '@state-adapt/react';

import { crewStore } from '../crew.store';
import { CrewStat } from './crew-stat';

export function CrewHero() {
  const [crew] = useStore(crewStore);

  return (
    <section className="panel crew-hero">
      <div>
        <p className="eyebrow">Entity adapter showcase</p>
        <h1>Flight Operations</h1>
        <p className="muted">
          One normalized roster powers this dashboard, its filtered views, bulk commands,
          and every detail page.
        </p>
      </div>
      <div className="crew-stats" aria-label="Roster statistics">
        <CrewStat label="Roster" value={crew.count} testId="crew-count" />
        <CrewStat label="Active" value={crew.activeCount} testId="crew-active-count" />
        <CrewStat
          label="Flight ready"
          value={crew.availableCount}
          testId="crew-available-count"
        />
        <CrewStat
          label="Selected"
          value={crew.selectedCount}
          testId="crew-selected-count"
        />
      </div>
    </section>
  );
}
