import { useEffect, useMemo, useState } from 'react';
import { take } from 'rxjs/operators';
import { SmartStore, StateAdapt } from '../../../../libs/rxjs/src';
import { FilteredStoreSelectors } from './proxy-store-tuple.type';
import { Subscription } from 'rxjs';

/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `useStore`

  > Copilot tip: Copy examples into your file or click to definition to open file with context for better Copilot suggestions.

  `useStore` is a custom hook that takes in a store created with {@link StateAdapt.adapt}, subscribes to it,
  and returns a proxy that can be used as if it is an object with derived state itself from selectors.
  When the store's state changes, it will trigger the component to re-render, no matter what selectors are being accessed from the proxy.
  To avoid unnecessary re-renders, you can pass in a list of selector names to only trigger re-renders when those specific selectors change.
  The selectors are evaluated lazily.

  #### Example: Basic useStore usage

  ```tsx
  import { adapt } from '../store'; // Import from wherever you configure StateAdapt
  import { useStore } from '../../../../libs/react/src';

  const nameStore = adapt(['name', 'Bob'], {
    concat: (state, name: string) => state + name,
    selectors: {
      uppercase: state => state.toUpperCase(),
    }
  });

  export function MyComponent() {
    const name = useStore(nameStore);
    return (
      <div>
        <h1>Hello {name.uppercase}</h1>
        <button onClick={() => nameStore.concat('!')}>Concat</button>
      </div>
    );
  }
  ```

  #### Example: useStore with filter selectors

  ```tsx
  import { adapt } from '../store'; // Import from wherever you configure StateAdapt
  import { useStore } from '../../../../libs/react/src';

  const nameStore = adapt(['name', 'Bob'], {
    concat: (state, name: string) => state + name,
    selectors: {
      uppercase: state => state.toUpperCase(),
    }
  });

  export function MyComponent() {
    // Only nameStore.uppercase$ will trigger re-renders
    const name = useStore(nameStore, ['uppercase']]);
    return (
      <div>
        <h1>Hello {name.uppercase}</h1>
        <button onClick={() => nameStore.concat('!')}>Concat</button>
      </div>
    );
  }
  ```

  #### Example: Lazy selector evaluation

  ```tsx
  import { adapt } from '../store'; // Import from wherever you configure StateAdapt
  import { useStore } from '../../../../libs/react/src';

  const counterStore = adapt(['counter', 0], {
    increment: state => state + 1,
    decrement: state => state - 1,
    selectors: {
      isEven: state => state % 2 === 0,
      isOdd: state => state % 2 !== 0,
    }
  });

  export function MyComponent() {
    const counter = useStore(counterStore);

    // Until the count is greater than 5 and the extra part below renders,
    // the isEvent and isOdd selectors will not be evaluated
    return (
      <div>
        <h1>Counter: {counter.state}</h1>
        <button onClick={() => counterStore.increment()}>Increment</button>
        <button onClick={() => counterStore.decrement()}>Decrement</button>

        {counter.state > 5 && (
          <h2>Is even: {counter.isEven ? 'Yes' : 'No'}</h2>
          <h2>Is odd: {counter.isOdd ? 'Yes' : 'No'}</h2>
        )}
      </div>
    );
  }
  ```
  */
export function useStore<
  Store extends SmartStore<any, { state: any }>,
  FilterSelectors extends (keyof Store['__']['selectors'])[],
>(
  store: Store,
  filterSelectors: FilterSelectors = ['state'] as FilterSelectors,
): FilteredStoreSelectors<Store, Extract<FilterSelectors[number], string>> {
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

  const proxy = useMemo(
    () =>
      new Proxy(store, {
        get: (target: any, prop: string) => {
          const __ = target.__ as any;
          if (!(prop in __.selectors)) {
            return undefined;
          }
          if (state === undefined) {
            const initialResult = __.selectors[prop](__.initialState);
            return initialResult;
          } else {
            // Return value synchronously
            let val: any;
            __.select((state: any) => {
              const result = __.fullSelectors[prop](state);
              return result;
            })
              .pipe(take(1))
              .subscribe((v: any) => (val = v));
            return val;
          }
        },
      }),
    [store, state],
  );

  return proxy;
}
