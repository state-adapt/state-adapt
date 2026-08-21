import { Component, inject } from '@angular/core';

import { LiveStores } from './live.store';

/** Always-visible readout of the ticker store's subscription lifecycle. */
@Component({
  standalone: true,
  selector: 'sa-ticker-lifecycle',
  template: `
    <span class="lifecycle">
      ticker store:
      <strong
        [class.ok]="lifecycle.isSubscribed()"
        [class.off]="!lifecycle.isSubscribed()"
        data-testid="ticker-status"
        >{{ lifecycle().status }}</strong
      >
      <span class="muted small">
        (<span data-testid="ticker-activations">{{ lifecycle().activations }}</span>
        activations,
        <span data-testid="ticker-teardowns">{{ lifecycle().teardowns }}</span>
        teardowns)
      </span>
    </span>
  `,
})
export class TickerLifecycleComponent {
  lifecycle = inject(LiveStores).lifecycle;
}
