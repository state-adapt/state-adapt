import { defer, interval } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { source, toSource } from '@state-adapt/rxjs';

export type LifecycleEvent = 'subscribe' | 'unsubscribe';

export const onTickerLifecycle = source<LifecycleEvent>('[Live] onTickerLifecycle');

/**
 * An interval that reports its own subscription and teardown.
 *
 * A StateAdapt store only subscribes to its sources while it has subscribers of
 * its own, so these events fire exactly when the ticker store activates and
 * deactivates — which is what makes the store's lifecycle observable from the
 * outside, and testable across route changes.
 */
export const onTick$ = defer(() => {
  onTickerLifecycle('subscribe');
  return interval(500);
}).pipe(
  finalize(() => onTickerLifecycle('unsubscribe')),
  toSource('[Live] onTick'),
);
