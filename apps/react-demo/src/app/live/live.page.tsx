import React from 'react';
import { NavLink } from 'react-router-dom';

import { LiveTicker } from './live-ticker';

export function LivePage() {
  return (
    <section className="panel">
      <h1>Live</h1>
      <p className="muted">
        This page and <NavLink to="/counter">Counter</NavLink> share one store fed by an
        RxJS <code>interval</code>. The store subscribes to that interval only while
        something is subscribed to the store, so navigating to a route that doesn&apos;t
        use it tears the interval down — watch the readout in the footer.
      </p>

      <LiveTicker label="Ticks since this store activated" />

      <p className="muted small">
        Leave for <NavLink to="/todos">Todos</NavLink> and come back: the count starts
        again from 0, because the store reset when it deactivated. Tick{' '}
        <strong>Keep ticker alive</strong> in the footer to hold a subscription open from
        the shell instead, and the count survives every route change.
      </p>
    </section>
  );
}
