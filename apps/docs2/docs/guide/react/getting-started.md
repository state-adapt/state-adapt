## React

First, install:

```sh
npm i -s rxjs
npm i -s @state-adapt/core
npm i -s @state-adapt/rxjs
npm i -s @state-adapt/react
```

Create a file named `state-adapt.ts` and export `watch` and `adapt`:

```typescript
import { defaultStateAdapt } from '@state-adapt/react';

export const stateAdapt = defaultStateAdapt;
export const { adapt, watch } = stateAdapt;
```

Provide StateAdapt in your app context:

```tsx
import { AdaptContext } from '@state-adapt/react';
import { stateAdapt } from './state-adapt';
// ...
  <React.StrictMode>
    <AdaptContext.Provider value={stateAdapt}> // [!code ++]
      <App />
    </AdaptContext.Provider> // [!code ++]
  </React.StrictMode>
// ...
```

Now in a component:

```tsx
import { useAdapt, useStore } from '@state-adapt/react';
import { adapt } from '/state-adapt';

const countStore = adapt(5);

export function HelloWorld {
  const [name, setName] = useAdapt('Bob');
  const [count, setCount] = useStore(countStore);
  // ...
}
```

For more configuration options, see [@state-adapt/react](/docs/react).

[StackBlitz Starter](https://stackblitz.com/edit/vitejs-vite-qcthao?file=src%2Fmain.tsx,src%2FCounter.tsx&terminal=dev)

## With Redux

First, install:

```sh
npm i -s rxjs
npm i -s @state-adapt/core
npm i -s @state-adapt/rxjs
npm i -s @state-adapt/react
```

Define your Redux store:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { adaptReducer, actionSanitizer, stateSanitizer } from '@state-adapt/core'; // [!code ++]
import { configureStateAdapt } from '@state-adapt/rxjs'; // [!code ++]

export const store = configureStore({
  reducer: {
    adapt: adaptReducer, // [!code ++]
  },
  devTools: (window as any).__REDUX_DEVTOOLS_EXTENSION__
    ? {
        actionSanitizer: actionSanitizer as any, // [!code ++]
        stateSanitizer: stateSanitizer as any, // [!code ++]
      }
    : false,
});
export const stateAdapt = configureStateAdapt({ store }); // [!code ++]
export const { adapt, watch } = stateAdapt; // [!code ++]
```

Provide StateAdapt in your app context:

```tsx
import { Provider } from 'react-redux';
import { AdaptContext } from '@state-adapt/react';
import { stateAdapt, store } from './store';
// ...
  <AdaptContext.Provider value={stateAdapt}> // [!code ++]
    <Provider store={store}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </Provider>
  </AdaptContext.Provider> // [!code ++]
// ...
```

Now in a component:

```tsx
import { useAdapt, useStore } from '@state-adapt/react';
import { adapt } from '/store';

const countStore = adapt(5);

export function HelloWorld {
  const [name, setName] = useAdapt('Bob');
  const [count, setCount] = useStore(countStore);
  // ...
}
```

For more configuration options, see [@state-adapt/react](/docs/react).

[StackBlitz Starter](https://stackblitz.com/edit/vitejs-vite-ucaub3?file=src%2Fstore.tsx,src%2Fmain.tsx,src%2FCounter.tsx&terminal=dev)
