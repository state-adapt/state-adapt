import { useDebugValue, useMemo } from 'react';
import { Observable } from 'rxjs';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

/**
 * Subscribes the component to an observable and returns its latest value.
 *
 * Until the observable emits, the hook returns `undefined` or the provided
 * initial value. The initial value is also used during server rendering.
 *
 * ```tsx
 * import { useObservable } from '@state-adapt/react';
 * import { interval } from 'rxjs';
 *
 * const tick$ = interval(1000);
 *
 * function Timer() {
 *   const tick = useObservable(tick$);
 *
 *   return <p>{tick}</p>;
 * }
 * ```
 */
export function useObservable<T, Args extends [] | [initialValue: NoInfer<T>]>(
  obs$: Observable<T>,
  ...args: Args
): Args extends [] ? T | undefined : T {
  const observableStore = useMemo(() => {
    let snapshot = args[0];

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

  const snapshot = useSyncExternalStore(
    observableStore.subscribe,
    observableStore.getSnapshot,
    observableStore.getSnapshot,
  );
  useDebugValue(snapshot);
  return snapshot as Args extends [] ? T | undefined : T;
}
