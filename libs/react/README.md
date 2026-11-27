# @state-adapt/react

React integration with hooks for stores, sources, and derived state.

## Getting Started

<!-- #region getting-started -->

```sh
npm install @state-adapt/react
```

Create a local store with `useAdapt`, or consume a shared store with `useStore`:

```tsx
import { adapt, useAdapt, useStore } from '@state-adapt/react';

const countStore = adapt(5);

export function HelloWorld() {
  const [name, setName] = useAdapt('Bob');
  const [count, setCount] = useStore(countStore);

  return (
    <>
      <p>
        Hello {name.state}! Count: {count.state}
      </p>
      <button onClick={() => setName('Alice')}>Change name</button>
      <button onClick={() => setCount(count.state + 1)}>Increment</button>
    </>
  );
}
```

### Advanced Configuration

To customize StateAdapt, use the React package's
[`createStateAdapt`](https://state-adapt.github.io/api/react/index/createStateAdapt).

[StackBlitz Starter](https://stackblitz.com/edit/vitejs-vite-qcthao?file=src%2Fmain.tsx,src%2FCounter.tsx&terminal=dev)

<!-- #endregion getting-started -->

If you install peer dependencies manually, also install `rxjs` and
`@state-adapt/core` and `@state-adapt/rxjs` at the same version as this package.
