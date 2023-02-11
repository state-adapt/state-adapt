import { useEffect, useMemo, useState } from 'react';
import { take } from 'rxjs/operators';
import { SmartStore, StateAdapt } from '@state-adapt/rxjs';
import { SelectorsFromStore } from './proxy-store-tuple.type';

/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `useStore`

  > Copilot tip: Copy examples into your file or click to definition to open file with context for better Copilot suggestions.

  `useStore` is a custom hook that takes in a store created outside a component with {@link StateAdapt.adapt}, subscribes to it,
  and returns a proxy that can be used as if it is an object with derived state itself from selectors.
  When the store's state changes, it will trigger the component to re-render, no matter what selectors are being accessed from the proxy.
  The selectors are evaluated lazily.

  #### Example: Basic useStore usage

  ```tsx
  import { adapt } from '../store'; // Import from wherever you configure StateAdapt
  import { useStore } from '@state-adapt/react';

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

  #### Example: Lazy selector evaluation

  ```tsx
  import { adapt } from '../store'; // Import from wherever you configure StateAdapt
  import { useStore } from '@state-adapt/react';

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
export function useStore<Store extends SmartStore<any, any>>(
  store: Store,
): SelectorsFromStore<Store> {
  const [{ initial }, setState] = useState({
    initial: true,
    state: (store.__ as any).initialState,
  });

  useEffect(() => {
    const sub = store.state$.subscribe(setState);
    return () => sub.unsubscribe();
  }, [store]);

  const proxy = useMemo(
    () =>
      new Proxy(store, {
        get: (target: any, prop: string) => {
          if (initial) {
            const initialResult = (store.__ as any).selectors[prop](
              (store.__ as any).initialState,
            );
            return initialResult;
          } else {
            // Return value immediately
            let val: any;
            store.__.select((state: any) => {
              const result = store.__.fullSelectors[prop](state);
              return result;
            })
              .pipe(take(1))
              .subscribe((v: any) => (val = v));
            return val;
          }
        },
      }),
    [store, initial],
  );

  return proxy;
}
