import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LiveTickerComponent } from './live-ticker';

@Component({
  selector: 'sa-live-page',
  imports: [RouterLink, LiveTickerComponent],
  template: `
    <section class="panel">
      <h1>Live</h1>
      <p class="muted">
        This page and <a routerLink="/counter">Counter</a> share one store fed by an
        RxJS <code>interval</code>. The store subscribes to that interval only while
        something is subscribed to the store, so navigating to a route that doesn't
        use it tears the interval down — watch the readout in the footer.
      </p>

      <sa-live-ticker label="Ticks since this store activated" />

      <p class="muted small">
        Leave for <a routerLink="/todos">Todos</a> and come back: the count starts
        again from 0, because the store reset when it deactivated. Tick
        <strong>Keep ticker alive</strong> in the footer to hold a subscription open from
        the shell instead, and the count survives every route change.
      </p>
    </section>
  `,
})
export class LivePageComponent {}
