import { Component, inject } from '@angular/core';

import { LiveStores } from './live.store';

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
