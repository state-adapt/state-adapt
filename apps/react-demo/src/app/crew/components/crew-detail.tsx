import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@state-adapt/react';

import { CrewStatus } from '../crew.adapter';
import { crewStore } from '../crew.store';
import { crewStatusLabels, getInitials } from '../crew.view';

export function CrewDetail({ callSign }: { callSign: string }) {
  const [crew, setCrew] = useStore(crewStore);
  const member = crew.entities[callSign];

  if (!member) {
    return (
      <section className="panel" data-testid="crew-not-found">
        <h1>Crew member not found</h1>
        <p className="muted">No roster record has the call sign {callSign}.</p>
        <Link className="button" to="/crew">
          Back to roster
        </Link>
      </section>
    );
  }

  return (
    <>
      <Link className="back-link" to="/crew">
        ← Back to roster
      </Link>
      <section className="panel crew-detail" data-testid="crew-detail">
        <div className="crew-detail-heading">
          <div className="crew-avatar large" aria-hidden="true">
            {getInitials(member.name)}
          </div>
          <div>
            <p className="eyebrow">{member.callSign}</p>
            <h1>{member.name}</h1>
            <p className="muted">{member.role}</p>
          </div>
          <span className={`status status-${member.status}`}>
            {crewStatusLabels[member.status]}
          </span>
        </div>

        <dl className="detail-grid">
          <div>
            <dt>Security clearance</dt>
            <dd data-testid="crew-detail-clearance">Level {member.clearance}</dd>
          </div>
          <div>
            <dt>Completed missions</dt>
            <dd data-testid="crew-detail-missions">{member.missionsCompleted}</dd>
          </div>
          <div>
            <dt>Manifest</dt>
            <dd>{member.selected ? 'Selected' : 'Not selected'}</dd>
          </div>
          <div>
            <dt>Flight readiness</dt>
            <dd>
              {member.status === 'active' && member.clearance >= 3 ? 'Ready' : 'Hold'}
            </dd>
          </div>
        </dl>

        <div className="detail-actions">
          <button
            className="primary"
            data-testid="crew-log-mission"
            onClick={() => setCrew.logOneMission(member.callSign)}
          >
            Log mission
          </button>
          <button
            data-testid="crew-promote"
            disabled={member.clearance === 5}
            onClick={() => setCrew.awardOne([member.callSign, 1])}
          >
            Raise clearance
          </button>
          <button
            data-testid="crew-toggle-selected"
            onClick={() => setCrew.toggleOneSelected(member.callSign)}
          >
            {member.selected ? 'Remove from manifest' : 'Add to manifest'}
          </button>
        </div>

        <label className="field detail-status">
          <span>Assignment status</span>
          <select
            data-testid="crew-status"
            value={member.status}
            onChange={event =>
              setCrew.setOneStatus([member.callSign, event.target.value as CrewStatus])
            }
          >
            <option value="active">Active</option>
            <option value="training">Training</option>
            <option value="leave">On leave</option>
          </select>
        </label>
      </section>
    </>
  );
}
