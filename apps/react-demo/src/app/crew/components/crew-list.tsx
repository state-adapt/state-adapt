import React from 'react';

import { CrewMember } from '../crew.adapter';
import { CrewFilter } from '../crew.types';
import { CrewCard } from './crew-card';

export function CrewList({
  visible,
  filter,
}: {
  visible: CrewMember[];
  filter: CrewFilter;
}) {
  return (
    <section className="crew-list" data-testid="crew-list">
      {visible.map(member => (
        <CrewCard member={member} key={member.callSign} />
      ))}
      {!visible.length && (
        <p className="panel muted empty" data-testid="crew-empty">
          No crew match the <strong>{filter}</strong> view.
        </p>
      )}
    </section>
  );
}
