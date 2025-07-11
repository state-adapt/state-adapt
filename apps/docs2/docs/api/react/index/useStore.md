# Function: useStore()

> **useStore**\<`Store`, `FilterSelectors`\>(`store`, `filterSelectors`): `ProxyStoreTuple`\<`Store`\[`"__"`\]\[`"initialState"`\], `Store`, `Extract`\<`FilterSelectors`\[`number`\], `string`\>\>

Defined in: [lib/use-store.ts:107](https://github.com/state-adapt/state-adapt/blob/4ff8540684d6d76a52452612f8fa44ffd7c6016a/libs/react/src/lib/use-store.ts#L107)

`useStore` is a custom hook that takes in a store created with [StateAdapt.adapt](../../rxjs/index/StateAdapt.md#adapt), subscribes to it,
and returns a tuple `[selectorResults, setState]` where `selectorResults` is a proxy object containing results from the store's selectors,
and `setState` is a function with additional properties assigned from the store object that was passed into `useStore`.

When the store's state changes, it will trigger a component re-render, no matter what selectors are being accessed from the proxy.
To avoid unnecessary re-renders, you can pass in a list of selector names to only trigger re-renders when those specific selectors change.
The selectors are evaluated lazily.

#### Example: Basic useStore usage

```tsx
import { adapt } from '../store'; // Import from wherever you configure StateAdapt
import { useStore } from '@state-adapt/react';

const nameStore = adapt('Bob', {
  concat: (state, name: string) => state + name,
  selectors: {
    uppercase: state => state.toUpperCase(),
  }
});

export function MyComponent() {
  const [name, setName] = useStore(nameStore);
  return (
    <div>
      <h1>Hello {name.uppercase}</h1>
      <button onClick={() => setName.concat('!')}>Concat</button>
    </div>
  );
}
```

#### Example: useStore with filter selectors

```tsx
import { adapt } from '../store'; // Import from wherever you configure StateAdapt
import { useStore } from '@state-adapt/react';

const nameStore = adapt('Bob', {
  concat: (state, name: string) => state + name,
  selectors: {
    uppercase: state => state.toUpperCase(),
  }
});

export function MyComponent() {
  // Only name.uppercase will trigger re-renders
  const [name, setName] = useStore(nameStore, ['uppercase']);
  return (
    <div>
      <h1>Hello {name.uppercase}</h1>
      <button onClick={() => setName.concat('!')}>Concat</button>
    </div>
  );
}
```

#### Example: Lazy selector evaluation

```tsx
import { adapt } from '../store'; // Import from wherever you configure StateAdapt
import { useStore } from '@state-adapt/react';

const counterStore = adapt(0, {
  increment: state => state + 1,
  decrement: state => state - 1,
  selectors: {
    isEven: state => state % 2 === 0,
    isOdd: state => state % 2 !== 0,
  }
});

export function MyComponent() {
  const [counter, setCounter] = useStore(counterStore);

  // Until the count is greater than 5 and the extra part below renders,
  // the isEvent and isOdd selectors will not be evaluated
  return (
    <div>
      <h1>Counter: {counter.state}</h1>
      <button onClick={() => setCounter.increment()}>Increment</button>
      <button onClick={() => setCounter.decrement()}>Decrement</button>

      {counter.state > 5 && (
        <h2>Is even: {counter.isEven ? 'Yes' : 'No'}</h2>
        <h2>Is odd: {counter.isOdd ? 'Yes' : 'No'}</h2>
      )}
    </div>
  );
}
```

## Type Parameters

### Store

`Store` *extends* `StoreLike`\<`any`, `any`, `any`\>

### FilterSelectors

`FilterSelectors` *extends* keyof `Store`\[`"__"`\]\[`"selectors"`\][]

## Parameters

### store

`Store`

### filterSelectors

`FilterSelectors` = `...`

## Returns

`ProxyStoreTuple`\<`Store`\[`"__"`\]\[`"initialState"`\], `Store`, `Extract`\<`FilterSelectors`\[`number`\], `string`\>\>
