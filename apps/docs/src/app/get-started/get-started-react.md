## Tutorials

[Basic Syntax](/react#1-start-with-simple-state)

## Documentation

[@state-adapt/react](/docs/react)

## Setup

[React](react/get-started#react)

[React and Redux](react/get-started#react-and-redux)

### React

[StackBlitz demo](https://stackblitz.com/edit/vitejs-vite-qcthao?file=src%2Fmain.tsx,src%2FCounter.tsx&terminal=dev)

First, `npm install`:

```
npm i -s rxjs
npm i -s @state-adapt/{core,rxjs,react}
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
  <AdaptContext.Provider value={stateAdapt}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AdaptContext.Provider>,
```

And now you can use it in your components:

```tsx
import { useAdapt } from '@state-adapt/react';
// ...
const [name, nameStore] = useAdapt('name', '');
console.log(name.state);
```

For more configuration options, see [@state-adapt/react](/docs/react).

Go to [Tutorials](react/get-started#tutorials) for help on how to use StateAdapt after setup.

### React and Redux

[StackBlitz demo](https://stackblitz.com/edit/vitejs-vite-ucaub3?file=src%2Fstore.tsx,src%2Fmain.tsx,src%2FCounter.tsx&terminal=dev)

First, `npm install`:

```
npm i -s rxjs
npm i -s @state-adapt/{core,rxjs,react}
```

Define your Redux store:

```typescript
import {
  adaptReducer,
  actionSanitizer,
  stateSanitizer,
} from '@state-adapt/core';
import { configureStateAdapt } from '@state-adapt/rxjs';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    adapt: adaptReducer,
    // Any other reducers you have with Redux
  },
  devTools: (window as any).__REDUX_DEVTOOLS_EXTENSION__
    ? {
        actionSanitizer: actionSanitizer as any,
        stateSanitizer: stateSanitizer as any,
      }
    : false,
});
export const stateAdapt = configureStateAdapt({ store });
export const { adapt, watch } = stateAdapt;
```

Provide StateAdapt in your app context:

```tsx
import { Provider } from 'react-redux';
import { AdaptContext } from '@state-adapt/react';
import { stateAdapt, store } from './store';
// ...
  <AdaptContext.Provider value={stateAdapt}>
    <Provider store={store}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </Provider>
  </AdaptContext.Provider>,
```

And now you can use it in your components:

```tsx
import { useAdapt } from '@state-adapt/react';
// ...
const [name, nameStore] = useAdapt('name', '');
console.log(name.state);
```

For more configuration options, see [@state-adapt/react](/docs/react).

Go to [Tutorials](react/get-started#tutorials) for help on how to use StateAdapt after setup.
