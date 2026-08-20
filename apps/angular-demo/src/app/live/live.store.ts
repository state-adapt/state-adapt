import { Injectable } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { initialLifecycleState, lifecycleAdapter, tickerAdapter } from './live.adapter';
import { onTick, onTickerLifecycle } from './live.source';

/**
 * Shared between the `/live` and `/counter` routes. It activates when the first
 * of those routes mounts a subscriber and deactivates when the last one goes
 * away — so navigating to a route that doesn't use it tears down the interval,
 * and coming back starts a fresh one from 0.
 */
@Injectable({ providedIn: 'root' })
export class LiveStores {
  ticker = adapt(0, {
    adapter: tickerAdapter,
    sources: { increment: onTick },
    path: 'ticker',
  });

  lifecycle = adapt(initialLifecycleState, {
    adapter: lifecycleAdapter,
    sources: { record: onTickerLifecycle },
    path: 'tickerLifecycle',
  });

  constructor() {
    /**
     * Subscribed here rather than in a component on purpose. Child effects run
     * before parent effects, so a route mounting the ticker would activate it — and
     * emit its first `subscribe` event — before the shell's own store read had
     * subscribed, and the event would be missed. This keeps the recorder listening
     * for the lifetime of the app.
     */
    this.lifecycle.state$.subscribe();
  }
}
