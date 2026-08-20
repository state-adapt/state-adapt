import React from 'react';
import { useAdapt, useStore } from '@state-adapt/react';

import { crewStore } from '../crew.store';
import { CrewFilter, CrewSort, CrewViewSelector } from '../crew.types';
import { capitalize } from '../crew.view';
import { CrewControls } from './crew-controls';
import { CrewHero } from './crew-hero';
import { CrewList } from './crew-list';

export function CrewRoster() {
  const [crew] = useStore(crewStore);
  const [filter, setFilter] = useAdapt('all' as CrewFilter);
  const [sort, setSort] = useAdapt('name' as CrewSort);
  const viewSelector = `${filter.state}By${capitalize(sort.state)}` as CrewViewSelector;

  return (
    <>
      <CrewHero />
      <CrewControls
        filter={filter.state}
        setFilter={setFilter}
        sort={sort.state}
        setSort={setSort}
      />
      <CrewList visible={crew[viewSelector]} filter={filter.state} />
    </>
  );
}
