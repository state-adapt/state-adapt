import { useMemo } from 'react';
import { Observable } from 'rxjs';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

/**
 * Subscribes to an observable and returns its latest value. An optional initial value is
 * returned during the first render and during server rendering until the observable emits.
 */
export function useObservable<T>(obs$: Observable<T>): T | undefined;
export function useObservable<T>(obs$: Observable<T>, initialValue: T): T;
export function useObservable<T>(obs$: Observable<T>, initialValue?: T): T | undefined {
  const observableStore = useMemo(() => {
    let snapshot = initialValue;

    return {
      getSnapshot: () => snapshot,
      subscribe: (onStoreChange: () => void) => {
        const subscription = obs$.subscribe(value => {
          if (!Object.is(value, snapshot)) {
            snapshot = value;
            onStoreChange();
          }
        });
        return () => subscription.unsubscribe();
      },
    };
    // Like useState, the initial value is only used when the observable changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obs$]);

  return useSyncExternalStore(
    observableStore.subscribe,
    observableStore.getSnapshot,
    observableStore.getSnapshot,
  );
}
