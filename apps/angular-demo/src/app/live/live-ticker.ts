import { Component, Input, inject } from '@angular/core';

import { LiveStores } from './live.store';

/**
 * Reading `ticker` in the template is what activates it. Rendering this on more
 * than one route is what makes the store "shared".
 */
@Component({
  standalone: true,
  selector: 'sa-live-ticker',
  preserveWhitespaces: false,
  template: `
    <div class="ticker" data-testid="ticker">
      <span class="ticker-dot" aria-hidden="true"></span>
      <span>
        {{ label }}: <strong data-testid="ticker-count">{{ ticker() }}</strong>
        <span class="muted small">({{ ticker.label() }})</span>
      </span>
    </div>
  `,
})
export class LiveTickerComponent {
  @Input() label = 'Shared ticker';
  ticker = inject(LiveStores).ticker;
}

/**
 * A subscriber with no UI of its own. Mounted from the shell, it holds the
 * ticker store active across every route.
 */
@Component({
  standalone: true,
  selector: 'sa-ticker-keep-alive',
  host: { style: 'display: none' },
  template: '{{ ticker() }}',
})
export class TickerKeepAliveComponent {
  ticker = inject(LiveStores).ticker;
}

/** Always-visible readout of the ticker store's subscription lifecycle. */
@Component({
  standalone: true,
  selector: 'sa-ticker-lifecycle',
  preserveWhitespaces: false,
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
