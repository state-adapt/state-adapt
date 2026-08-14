import { StoreLike } from '@state-adapt/rxjs';
import { useContext, useMemo } from 'react';
import { Subscription } from 'rxjs';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { AdaptContext } from './adapt.context';
import { StoreStates } from './proxy-store-tuple.type';

type StoreSnapshot = {
  storeState: any;
  selectorValues: any[];
};

export function useProxyStates<
  Store extends StoreLike<any, any, any>,
  FilterSelectors extends (keyof Store['__']['selectors'])[],
>(
  store: Store,
  filterSelectors: FilterSelectors = ['state'] as FilterSelectors,
): StoreStates<Store, Extract<FilterSelectors[number], string>> {
  const stateAdapt = useContext(AdaptContext);
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
