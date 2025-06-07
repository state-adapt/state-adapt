import { StoreLike } from '@state-adapt/rxjs';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Subscription } from 'rxjs';
import { AdaptContext } from './adapt.context';
import { StoreStates } from './proxy-store-tuple.type';

export function useProxyStates<
  Store extends StoreLike<any, any, any>,
  FilterSelectors extends (keyof Store['__']['selectors'])[],
>(
  store: Store,
  filterSelectors: FilterSelectors = ['state'] as FilterSelectors,
): StoreStates<Store, Extract<FilterSelectors[number], string>> {
  const [state, setState] = useState<any>();

  useEffect(() => {
    const sub = new Subscription();
    filterSelectors.forEach(selectorName => {
      sub.add(
        (store[((selectorName as string) + '$') as keyof Store] as any).subscribe(() =>
          setState({}),
        ),
      );
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, filterSelectors.join()]);

  const stateAdapt = useContext(AdaptContext);

  const proxy = useMemo(
    () =>
      new Proxy(store, {
        get: (target: any, prop: string) => {
          const __ = target.__ as any;
          if (!(prop in __.selectors)) {
            return undefined;
          }
          // State selectors now return initialState when inactive, so before useEffect runs this will not error.
          // When useStore first runs for an already-active store, this approach allows it to use the current state
          // instead of initialState.
          const globalState = (stateAdapt as any).commonStore.value;
          const storeState = __.fullSelectors.state(globalState);
          const result = __.selectors[prop](storeState);
          return result;
        },
      }),
    [store, state],
  );

  return proxy;
}
