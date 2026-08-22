import { StoreLike } from '@state-adapt/rxjs';
import { useContext, useDebugValue, useMemo } from 'react';
import { Subscription } from 'rxjs';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { AdaptContext } from './adapt.context';
import { StoreStates } from './proxy-store-tuple.type';

type StoreSnapshot = {
  storeState: any;
  selectorValues: any[];
};

export const STATE_ADAPT_CONTEXT_MISMATCH_ERROR = `StateAdapt Error: This store was created by a different StateAdapt instance than the one provided to React through AdaptContext. Make sure the store and React use the same StateAdapt instance. If you created an instance with createStateAdapt, provide that instance through AdaptContext and import adapt and watch from the module where you called createStateAdapt instead of @state-adapt/react.`;

export function useProxyStates<
  Store extends StoreLike<any, Record<never, never>, Record<never, never>>,
  FilterSelectors extends (keyof Store['__']['selectors'])[],
>(
  store: Store,
  filterSelectors: FilterSelectors = ['state'] as FilterSelectors,
): StoreStates<Store, Extract<FilterSelectors[number], string>> {
  const stateAdapt = useContext(AdaptContext);

  if (store.__.stateAdaptInstanceId !== (stateAdapt as any).stateAdaptInstanceId) {
    throw new Error(STATE_ADAPT_CONTEXT_MISMATCH_ERROR);
  }

  const filterSelectorsKey = filterSelectors.join();
  const stableFilterSelectors = useMemo(
    () => [...filterSelectors] as string[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterSelectorsKey],
  );

  const getSnapshot = useMemo(() => {
    let snapshot: StoreSnapshot | undefined;

    return (): StoreSnapshot => {
      const __ = store.__ as any;

      // Until `subscribe` below activates the store, an initial state factory runs on
      // every read and returns a new value each time. React requires repeated reads to
      // be identity-stable, so reuse the first one and let activation replace it.
      if (snapshot && !__.isActive()) return snapshot;

      const globalState = (stateAdapt as any).commonStore.value;
      const storeState = __.fullSelectors.state(globalState);
      const selectorValues = stableFilterSelectors.map(selectorName =>
        __.selectors[selectorName](storeState),
      );
      const previousSnapshot = snapshot;

      if (
        previousSnapshot &&
        selectorValues.length === previousSnapshot.selectorValues.length &&
        selectorValues.every((value, index) =>
          Object.is(value, previousSnapshot.selectorValues[index]),
        )
      ) {
        return previousSnapshot;
      }

      return (snapshot = { storeState, selectorValues });
    };
  }, [stableFilterSelectors, stateAdapt, store]);

  const subscribe = useMemo(
    () => (onStoreChange: () => void) => {
      const subscription = new Subscription();
      stableFilterSelectors.forEach(selectorName => {
        subscription.add(
          (store[`${selectorName}$` as keyof Store] as any).subscribe(onStoreChange),
        );
      });
      return () => subscription.unsubscribe();
    },
    [stableFilterSelectors, store],
  );
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useDebugValue(snapshot.storeState);

  const proxy = useMemo(
    () =>
      new Proxy(store, {
        get: (target: any, prop: string) => {
          const __ = target.__ as any;
          if (!(prop in __.selectors)) {
            return undefined;
          }
          const result = __.selectors[prop](snapshot.storeState);
          return result;
        },
      }),
    [snapshot, store],
  );

  return proxy;
}
