# Getting Started

Set up StateAdapt with

- [Angular](getting-started#angular)
- [Angular and NgRx](getting-started#angular-and-ngrx)
- [Angular and NGXS](getting-started#angular-and-ngxs)
- [React](getting-started#react)
- [React and Redux](getting-started#react-and-redux)

## Angular

[StackBlitz Demo](https://stackblitz.com/edit/state-adapt-angular?file=src%2Fapp%2Fapp.module.ts)

First, `npm install`:

```
npm i -s @state-adapt/core @state-adapt/angular
```

Include in app.module.ts like so:

```typescript
import { defaultStoreProvider } from '@state-adapt/core';
// ...
    providers: [defaultStoreProvider],
```

Now in a component or service:

```typescript
import { adapt } from '@state-adapt/angular';
// ...
  stringStore = adapt('string', '');
  constructor() {
    this.stringStore.state$.subscribe(console.log);
    this.stringStore.set('Hello World!');
  }
// ...
```

Open up Redux Devtools and you should see the state update immediately to `'Hello World!'`.

## Angular and NgRx

[StackBlitz Demo](https://stackblitz.com/edit/state-adapt-angular-with-ngrx?file=src%2Fapp%2Fapp.module.ts)

First, `npm install`:

```
npm i -s @state-adapt/core @state-adapt/ngrx
```

Include in your app.module.ts like so:

```typescript
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { adaptReducer, actionSanitizer, stateSanitizer } from '@state-adapt/core';
// ...
// In your module imports array:
    StoreModule.forRoot({ adapt: adaptReducer }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      actionSanitizer,
      stateSanitizer,
    }),
```

Now in a component or service:

```typescript
import { adapt } from '@state-adapt/ngrx';
// ...
  stringStore = adapt('string', '');
  constructor() {
    this.stringStore.state$.subscribe(console.log);
    this.stringStore.set('Hello World!');
  }
// ...
```

Open up Redux Devtools and you should see the state update immediately to `'Hello World!'`.

## Angular and NGXS

[StackBlitz Demo](https://stackblitz.com/edit/state-adapt-angular-with-ngxs?file=src%2Fapp%2Fapp.module.ts)

First, `npm install`:

```
npm i -s @state-adapt/core @state-adapt/ngxs
```

Include in your app.module.ts like so:

```typescript
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
import { AdaptState } from '@state-adapt/ngxs';
// ...
// In your module imports array:
    NgxsModule.forRoot([AdaptState], {
      developmentMode: !environment.production
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production,
      actionSanitizer,
      stateSanitizer,
    }),
```

Now in a component or service:

```typescript
import { adapt } from '@state-adapt/ngxs';
// ...
  stringStore = adapt('string', '');
  constructor() {
    this.stringStore.state$.subscribe(console.log);
    this.stringStore.set('Hello World!');
  }
// ...
```

Open up Redux Devtools and you should see the state update immediately to `'Hello World!'`.

# React

[StackBlitz demo blocked by this issue](https://github.com/stackblitz/core/issues/1911)

First, `npm install`:

```
npm i -s @state-adapt/core @state-adapt/react
```

Define your adapt store:

```typescript
import { actionSanitizer, stateSanitizer, createStore } from '@state-adapt/core';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});
export const adapt = createStore(enableReduxDevTools);
```

Provide StateAdapt in your app context:

```tsx
import { AdaptContext } from '@state-adapt/react';
import { adapt } from './store';
// ...
  <AdaptContext.Provider value={adapt}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AdaptContext.Provider>,
```

And now you can use it in your components:

```tsx
import { useSource, useAdapt, useObservable } from '@state-adapt/react';

export function App() {
  const stringStore = useAdapt('string', '');
  const str = useObservable(stringStore.state$);

  return (
    <h1>{str}</h1>
    <button onClick={() => stringStore.set('new string')}>New String</button>
  )
}
```

Open up Redux Devtools and you should see the state update immediately to `'new string'`.

# React and Redux

[StackBlitz demo blocked by this issue](https://github.com/stackblitz/core/issues/1911)

First, `npm install`:

```
npm i -s @state-adapt/core @state-adapt/react
```

Define your Redux store:

```typescript
import {
  adaptReducer,
  actionSanitizer,
  stateSanitizer,
  createStateAdapt,
} from '@state-adapt/core';
import { combineReducers, createStore } from 'redux';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

export const store = createStore(
  combineReducers({
    adapt: adaptReducer,
    // Any other reducers you have with Redux
  }),
  enableReduxDevTools,
);
export const adapt = createStateAdapt(store);
```

Provide StateAdapt in your app context:

```tsx
import { Provider } from 'react-redux';
import { AdaptContext } from '@state-adapt/react';
import { adapt, store } from './store';
// ...
  <AdaptContext.Provider value={adapt}>
    <Provider store={store}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </Provider>
  </AdaptContext.Provider>,
```

And now you can use it in your components:

```tsx
import { useSource, useAdapt, useObservable } from '@state-adapt/react';

export function App() {
  const stringStore = useAdapt('string', '');
  const str = useObservable(stringStore.state$);

  return (
    <h1>{str}</h1>
    <button onClick={() => stringStore.set('new string')}>New String</button>
  )
}
```

Open up Redux Devtools and you should see the state update immediately to `'new string'`.
