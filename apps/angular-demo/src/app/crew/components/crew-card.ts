import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CrewMember } from '../crew.adapter';
import { CrewStores } from '../crew.store';
import { crewStatusLabels, getInitials } from '../crew.view';

@Component({
  standalone: true,
  selector: 'sa-crew-card',
  preserveWhitespaces: false,
  imports: [RouterLink],
  template: `
    <article
      class="crew-card"
      [class.selected]="member.selected"
      data-testid="crew-card"
    >
      <label class="crew-check">
        <input
          [attr.aria-label]="'Select ' + member.name"
          [checked]="member.selected"
          [attr.data-testid]="'crew-select-' + member.callSign"
          type="checkbox"
          (change)="crew.toggleOneSelected(member.callSign)"
        />
      </label>
      <a class="crew-card-main" [routerLink]="['/crew', member.callSign]">
        <div class="crew-avatar" aria-hidden="true">
          {{ getInitials(member.name) }}
        </div>
        <div class="crew-identity">
          <h2>{{ member.name }}</h2>
          <p>{{ member.role }}</p>
          <code>{{ member.callSign }}</code>
        </div>
        <span [class]="'status status-' + member.status">
          {{ crewStatusLabels[member.status] }}
        </span>
        <dl class="crew-metrics">
          <div>
            <dt>Clearance</dt>
            <dd [attr.data-testid]="'crew-clearance-' + member.callSign">L{{ member.clearance }}</dd>
          </div>
          <div>
            <dt>Missions</dt>
            <dd>{{ member.missionsCompleted }}</dd>
          </div>
        </dl>
        <span class="crew-open" aria-hidden="true">→</span>
      </a>
      <button
        class="icon danger crew-remove"
        [attr.aria-label]="'Remove ' + member.name"
        [attr.data-testid]="'crew-remove-' + member.callSign"
        (click)="crew.removeOne(member.callSign)"
      >
        ✕
      </button>
    </article>
  `,
})
export class CrewCardComponent {
  @Input({ required: true }) member!: CrewMember;
  crew = inject(CrewStores).store;
  crewStatusLabels = crewStatusLabels;
  getInitials = getInitials;
}
