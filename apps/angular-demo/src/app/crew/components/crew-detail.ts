import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CrewStatus } from '../crew.adapter';
import { CrewStores } from '../crew.store';
import { crewStatusLabels, getInitials } from '../crew.view';

@Component({
  standalone: true,
  selector: 'sa-crew-detail',
  preserveWhitespaces: false,
  imports: [RouterLink],
  template: `
    @if (!member) {
      <section class="panel" data-testid="crew-not-found">
        <h1>Crew member not found</h1>
        <p class="muted">No roster record has the call sign {{ callSign }}.</p>
        <a class="button" routerLink="/crew">Back to roster</a>
      </section>
    } @else {
      <a class="back-link" routerLink="/crew">← Back to roster</a>
      <section class="panel crew-detail" data-testid="crew-detail">
        <div class="crew-detail-heading">
          <div class="crew-avatar large" aria-hidden="true">
            {{ getInitials(member.name) }}
          </div>
          <div>
            <p class="eyebrow">{{ member.callSign }}</p>
            <h1>{{ member.name }}</h1>
            <p class="muted">{{ member.role }}</p>
          </div>
          <span [class]="'status status-' + member.status">
            {{ crewStatusLabels[member.status] }}
          </span>
        </div>

        <dl class="detail-grid">
          <div>
            <dt>Security clearance</dt>
            <dd data-testid="crew-detail-clearance">Level {{ member.clearance }}</dd>
          </div>
          <div>
            <dt>Completed missions</dt>
            <dd data-testid="crew-detail-missions">{{ member.missionsCompleted }}</dd>
          </div>
          <div>
            <dt>Manifest</dt>
            <dd>{{ member.selected ? 'Selected' : 'Not selected' }}</dd>
          </div>
          <div>
            <dt>Flight readiness</dt>
            <dd>
              {{ member.status === 'active' && member.clearance >= 3 ? 'Ready' : 'Hold' }}
            </dd>
          </div>
        </dl>

        <div class="detail-actions">
          <button
            class="primary"
            data-testid="crew-log-mission"
            (click)="crew.logOneMission(member.callSign)"
          >
            Log mission
          </button>
          <button
            data-testid="crew-promote"
            [disabled]="member.clearance === 5"
            (click)="crew.awardOne([member.callSign, 1])"
          >
            Raise clearance
          </button>
          <button
            data-testid="crew-toggle-selected"
            (click)="crew.toggleOneSelected(member.callSign)"
          >
            {{ member.selected ? 'Remove from manifest' : 'Add to manifest' }}
          </button>
        </div>

        <label class="field detail-status">
          <span>Assignment status</span>
          <select
            data-testid="crew-status"
            [value]="member.status"
            (change)="onStatusChange($any($event.target).value)"
          >
            <option value="active">Active</option>
            <option value="training">Training</option>
            <option value="leave">On leave</option>
          </select>
        </label>
      </section>
    }
  `,
})
export class CrewDetailComponent {
  @Input({ required: true }) callSign!: string;
  crew = inject(CrewStores).store;
  crewStatusLabels = crewStatusLabels;
  getInitials = getInitials;

  get member() {
    return this.crew.entities()[this.callSign];
  }

  onStatusChange(status: CrewStatus) {
    this.crew.setOneStatus([this.callSign, status]);
  }
}
