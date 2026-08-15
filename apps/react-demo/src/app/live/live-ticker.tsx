import React from 'react';
import { useStore } from '@state-adapt/react';

import { lifecycleStore, tickerStore } from './live.store';

/**
 * Subscribing to `tickerStore` is what activates it. Rendering this on more than
 * one route is what makes the store "shared".
 */
export function LiveTicker({ label }: { label?: string }) {
  const [ticker] = useStore(tickerStore);

  return (
    <div className="ticker" data-testid="ticker">
      <span className="ticker-dot" aria-hidden="true" />
      <span>
        {label ?? 'Shared ticker'}: <strong data-testid="ticker-count">{ticker.state}</strong>{' '}
        <span className="muted small">({ticker.label})</span>
      </span>
    </div>
  );
}

/**
 * A subscriber with no UI of its own. Mounted from the shell, it holds the
 * ticker store active across every route.
 */
export function TickerKeepAlive() {
  useStore(tickerStore);
  return null;
}

/** Always-visible readout of the ticker store's subscription lifecycle. */
export function TickerLifecycle() {
  const [lifecycle] = useStore(lifecycleStore);

  return (
    <span className="lifecycle">
      ticker store:{' '}
      <strong
        className={lifecycle.isSubscribed ? 'ok' : 'off'}
        data-testid="ticker-status"
      >
        {lifecycle.state.status}
      </strong>{' '}
      <span className="muted small">
        (<span data-testid="ticker-activations">{lifecycle.state.activations}</span>{' '}
        activations, <span data-testid="ticker-teardowns">{lifecycle.state.teardowns}</span>{' '}
        teardowns)
      </span>
    </span>
  );
}
