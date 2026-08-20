import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@state-adapt/react';

import { CrewMember } from '../crew.adapter';
import { crewStore } from '../crew.store';
import { crewStatusLabels, getInitials } from '../crew.view';

export function CrewCard({ member }: { member: CrewMember }) {
  const [, setCrew] = useStore(crewStore);

  return (
    <article
      className={`crew-card ${member.selected ? 'selected' : ''}`}
      data-testid="crew-card"
    >
      <label className="crew-check">
        <input
          aria-label={`Select ${member.name}`}
          checked={member.selected}
          data-testid={`crew-select-${member.callSign}`}
          type="checkbox"
          onChange={() => setCrew.toggleOneSelected(member.callSign)}
        />
      </label>
      <Link className="crew-card-main" to={`/crew/${member.callSign}`}>
        <div className="crew-avatar" aria-hidden="true">
          {getInitials(member.name)}
        </div>
        <div className="crew-identity">
          <h2>{member.name}</h2>
          <p>{member.role}</p>
          <code>{member.callSign}</code>
        </div>
        <span className={`status status-${member.status}`}>
          {crewStatusLabels[member.status]}
        </span>
        <dl className="crew-metrics">
          <div>
            <dt>Clearance</dt>
            <dd data-testid={`crew-clearance-${member.callSign}`}>L{member.clearance}</dd>
          </div>
          <div>
            <dt>Missions</dt>
            <dd>{member.missionsCompleted}</dd>
          </div>
        </dl>
        <span className="crew-open" aria-hidden="true">
          →
        </span>
      </Link>
      <button
        className="icon danger crew-remove"
        aria-label={`Remove ${member.name}`}
        data-testid={`crew-remove-${member.callSign}`}
        onClick={() => setCrew.removeOne(member.callSign)}
      >
        ✕
      </button>
    </article>
  );
}
