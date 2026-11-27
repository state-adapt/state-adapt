# @state-adapt/rxjs

The RxJS layer for defining stores, sources, and related state-management utilities.

## Getting Started

First, install:

```sh
npm i -s rxjs
npm i -s @state-adapt/core
npm i -s @state-adapt/rxjs
```

Create a file named `state-adapt.ts` and export `watch` and `adapt`:

```ts
import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
import { configureStateAdapt } from '@state-adapt/rxjs';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

export const { adapt, watch } = configureStateAdapt({
  devtools: enableReduxDevTools,
});
```
