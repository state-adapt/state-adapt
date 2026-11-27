# @state-adapt/core

The framework-agnostic core API for creating adapters, selectors, and reactions.

## Getting Started

<!-- #region getting-started -->

```sh
npm install @state-adapt/core
```

<!-- #endregion getting-started -->

Use `createAdapter` to define reusable state changes and selectors:

```ts
import { createAdapter } from '@state-adapt/core';

export const counterAdapter = createAdapter<number>()({
  increment: state => state + 1,
  selectors: {
    double: state => state * 2,
  },
});
```

Pass the adapter to `adapt` from your framework integration or the RxJS package.
