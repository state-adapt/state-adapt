import { Injectable } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { source } from '@state-adapt/rxjs';

import { CrewMember, crewAdapter, initialCrewState } from './crew.adapter';

export const onRecruit = source<CrewMember>('[Crew] onRecruit');

/** Kept in an injection context and read by the shell, so list edits survive
 * list/detail navigation. */
@Injectable({ providedIn: 'root' })
export class CrewStores {
  store = adapt(initialCrewState, {
    adapter: crewAdapter,
    sources: { addOne: onRecruit },
    path: 'crew',
  });
}
