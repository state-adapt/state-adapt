import { Component, inject, input } from '@angular/core';

import { LiveStores } from './live.store';

/**
 * Reading `ticker` in the template is what activates it. Rendering this on more
 * than one route is what makes the store "shared".
 */
@Component({
  standalone: true,
  selector: 'sa-live-ticker',
  template: `
    <div class="ticker" data-testid="ticker">
      <span class="ticker-dot" aria-hidden="true"></span>
      <span>
        {{ label() }}: <strong data-testid="ticker-count">{{ ticker() }}</strong>
        <span class="muted small">({{ ticker.label() }})</span>
      </span>
    </div>
  `,
})
export class LiveTickerComponent {
  label = input('Shared ticker');
  ticker = inject(LiveStores).ticker;
}
