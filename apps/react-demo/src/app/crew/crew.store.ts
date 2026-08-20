import { adapt } from '@state-adapt/react';
import { source } from '@state-adapt/rxjs';

import { CrewMember, crewAdapter, initialCrewState } from './crew.adapter';

export const onRecruit = source<CrewMember>('[Crew] onRecruit');

/** Kept at module scope and subscribed to by the shell, so list edits survive
 * list/detail navigation. */
export const crewStore = adapt(initialCrewState, {
  adapter: crewAdapter,
  sources: { addOne: onRecruit },
  path: 'crew',
});
