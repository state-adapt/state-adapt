---
next:
  text: 'API Reference'
  link: '/api/core/src/'
---

# Getting Started

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

And now you can use it in your components:

```tsx
import { from } from 'solid-js';
import { adapt } from '../state-adapt.function';

function Name() {
  const nameStore = adapt('Bob');
  const name = from(nameStore.state$);
  // ...
}
```

Solid's `from` function subscribes immediately, so it's good to use only in components.

::: info Library Coming Soon
StateAdapt doesn't currently have a dedicated library for Solid.

For now, refer to [`configureStateAdapt`](/api/rxjs/index/configureStateAdapt) for options.
:::

[StackBlitz demo](https://stackblitz.com/edit/solidjs-templates-oc7ivf?file=src%2Fadapt.function.ts)
