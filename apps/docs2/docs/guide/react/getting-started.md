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
npm i -s @state-adapt/react
```

Then create stores and use them in components:

```tsx
import { adapt, useAdapt, useStore } from '@state-adapt/react';

const countStore = adapt(5);

export function HelloWorld() {
  const [name, setName] = useAdapt('Bob');
  const [count, setCount] = useStore(countStore);
  // ...
}
```

### Advanced Configuration

To customize StateAdapt, create a configured instance and export its store
functions. This example disables Redux DevTools; see
[`configureStateAdapt`](/api/rxjs/index/configureStateAdapt) for every available
option.

```ts
import { configureStateAdapt } from '@state-adapt/rxjs';

export const stateAdapt = configureStateAdapt({ devtools: null });
export const { adapt, watch } = stateAdapt;
```

Import store functions from that file wherever you create stores:

```ts
// counter.store.ts
import { adapt } from './state-adapt';

export const countStore = adapt(5);
```

Provide the same configured instance to the React hooks at the root of your app:

```tsx
import { AdaptContext } from '@state-adapt/react';
import { stateAdapt } from './state-adapt';

root.render(
  <AdaptContext.Provider value={stateAdapt}>
    <App />
  </AdaptContext.Provider>,
);
```

To help ensure that `adapt`, `watch`, and `defaultStateAdapt` are imported from
the correct place, custom-configured applications can add this ESLint rule:

```js
// eslint.config.js
{
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@state-adapt/react',
            importNames: ['adapt', 'watch', 'defaultStateAdapt'],
            message:
              'Import this from your application state-adapt.ts module when using custom StateAdapt configuration.',
          },
        ],
      },
    ],
  },
}
```

::: warning Keep custom configuration imports consistent
The package-level `adapt` and `watch` always use the default configuration. With
a custom configuration, import them from your application's `state-adapt.ts`
file and provide that same `stateAdapt` through `AdaptContext`. Only combine
stores created by the same instance.

StateAdapt stops unsafe combinations with these errors:

```text
StateAdapt Error: This store was created by a different StateAdapt instance
than the one provided to React through AdaptContext. Make sure the store and
React use the same StateAdapt instance. If you configured StateAdapt, provide
that instance through AdaptContext and import adapt and watch from your
application's StateAdapt configuration module instead of @state-adapt/react.
```

```text
StateAdapt Error: joinStores cannot combine stores created by different
StateAdapt instances.
```

:::

[StackBlitz Starter](https://stackblitz.com/edit/vitejs-vite-qcthao?file=src%2Fmain.tsx,src%2FCounter.tsx&terminal=dev)
