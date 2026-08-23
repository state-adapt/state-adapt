import { useDebugValue, useMemo } from 'react';
import { StoreLike } from '@state-adapt/rxjs';
import { Subscription } from 'rxjs';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { Derived, DerivedConsumer, withDerivedConsumer } from './derived';

class ReactDerivedConsumer<Value> implements DerivedConsumer {
  private active = false;
  private notifying = false;
  private refreshQueued = false;
  private instanceId: symbol | undefined;
  private seenStores = new Set<StoreLike<any, any, any>>();
  private pendingStores = new Set<StoreLike<any, any, any>>();
  private snapshot: Value | undefined;
  private hasSnapshot = false;
  private subscriptions = new Map<StoreLike<any, any, any>, Subscription>();
  private listener: (() => void) | undefined;

  constructor(private derived: Derived<Value>) {}

  consume(store: StoreLike<any, any, any>) {
    const storeInstanceId = store.__.stateAdaptInstanceId;
    if (this.instanceId && this.instanceId !== storeInstanceId) {
      throw new Error(
        'StateAdapt Error: derive cannot combine stores created by different StateAdapt instances.',
      );
    }
    this.instanceId = storeInstanceId;
    this.seenStores.add(store);
  }

  getSnapshot = (): Value => {
    // Until `subscribe` activates the store dependencies, an initial state factory runs
    // on every read and returns a new value each time. React requires repeated reads to
    // be identity-stable, so reuse the first one and let activation replace it. Internal
    // refreshes always read, so a frozen snapshot never feeds subscription bookkeeping.
    if (this.hasSnapshot && this.hasInactiveDependency()) return this.snapshot as Value;
    return this.read();
  };

  private read(): Value {
    this.seenStores = new Set();
    const value = withDerivedConsumer(this, this.derived);
    this.pendingStores = this.seenStores;
    this.snapshot = value;
    this.hasSnapshot = true;
    return value;
  }

  private hasInactiveDependency() {
    let inactive = false;
    this.pendingStores.forEach(store => {
      if (!store.__.isActive()) inactive = true;
    });
    return inactive;
  }

  subscribe = (listener: () => void) => {
    this.active = true;
    this.listener = listener;
    try {
      this.refresh(false);
    } catch (error) {
      this.cleanup();
      throw error;
    }

    return () => this.cleanup();
  };

  private onStoreChange = () => {
    if (this.notifying) {
      this.refreshQueued = true;
      return;
    }
    this.refresh(true);
  };

  private refresh(notify: boolean) {
    if (!this.active) return;

    this.notifying = true;
    try {
      do {
        this.refreshQueued = false;
        this.read();
        this.reconcileSubscriptions();
      } while (this.refreshQueued);
    } finally {
      this.notifying = false;
    }

    if (notify) this.listener?.();
  }

  private reconcileSubscriptions() {
    this.pendingStores.forEach(store => {
      if (this.subscriptions.has(store)) return;
      const subscription = (store.state$ as any).subscribe(this.onStoreChange);
      this.subscriptions.set(store, subscription);
    });

    this.subscriptions.forEach((subscription, store) => {
      if (this.pendingStores.has(store)) return;
      subscription.unsubscribe();
      this.subscriptions.delete(store);
    });
  }

  private cleanup() {
    this.active = false;
    this.listener = undefined;
    this.instanceId = undefined;
    this.snapshot = undefined;
    this.hasSnapshot = false;
    this.pendingStores = new Set();
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions.clear();
  }
}

/**
 * Subscribes a React component to a value created with {@link derive}.
 *
 * ```tsx
 * import { adapt, derive, useDerived } from '@state-adapt/react';
 *
 * const priceStore = adapt(20);
 * const quantityStore = adapt(3);
 *
 * const deriveTotal = derive(() => priceStore() * quantityStore());
 *
 * function Total() {
 *   const total = useDerived(deriveTotal);
 *
 *   return <p>Total: {total}</p>;
 * }
 * ```
 *
 * `deriveTotal` is computed once per change, no matter how many components
 * subscribe.
 */
export function useDerived<Value>(derived: Derived<Value>): Value {
  const consumer = useMemo(() => new ReactDerivedConsumer(derived), [derived]);
  const value = useSyncExternalStore(
    consumer.subscribe,
    consumer.getSnapshot,
    consumer.getSnapshot,
  );
  useDebugValue(value);
  return value;
}
