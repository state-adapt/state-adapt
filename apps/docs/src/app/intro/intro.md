# Why StateAdapt?

## Minimal

StateAdapt achieves the original intent of Redux, but in a much more
minimal way. StateAdapt turns Actions into RxJS Subjects and reducers into
objects, reducing conceptual complexity and eliminating ~40% of the code
required to create event sources and state changes.

## Reactive

StateAdapt relies on RxJS for all unidirectional data flow. Rather than
removing pieces of Redux critical to reactivity, as most alternatives do,
StateAdapt simply reimplements them in RxJS.

## Reusable

StateAdapt uses state adapters to maximize reusability in state management.

## Learn More

[Introducing StateAdapt](https://medium.com/weekly-webtips/introducing-stateadapt-reusable-reactive-state-management-9f0388f1850e)

# Demos

- [StackBlitz: NgRx](https://stackblitz.com/edit/state-adapt-ngrx?file=src/app/app.component.ts)
- [StackBlitz: NgRx and State Adapt with Angular Reactive Forms](https://stackblitz.com/edit/angular-reactive-forms-state-management?file=src%2Fapp%2Fform%2Fstate-adapt-form.component.ts)
- [StackBlitz: NGXS](https://stackblitz.com/edit/state-adapt-ngxs?file=src/app/app.component.ts)
- [StackBlitz: React](https://stackblitz.com/edit/state-adapt-react)
- [StackBlitz: React & Redux](https://stackblitz.com/edit/state-adapt-react-with-redux)
- [Dashboards Demo App](/dashboards)

# Getting Started

Set up StateAdapt with

- [Angular with NgRx](#ngrx)
- [Angular with NGXS](#ngxs)
- [React](#react)
- [React with Redux](#react-with-redux)

## NgRx

First, `npm install`:

```
npm i -s @state-adapt/core @state-adapt/ngrx reselect
```

Include in your app.module.ts like so:

```typescript
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import {
  adaptReducer,
  actionSanitizer,
  stateSanitizer,
} from '@state-adapt/core';
```

In your module imports array:

```typescript
    StoreModule.forRoot({ adapt: adaptReducer }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      actionSanitizer,
      stateSanitizer,
    }),
```

Now you can use it in a component or service. Here's an example in a component:

```typescript
import { Source, createAdapter } from '@state-adapt/core';
import { Adapt } from '@state-adapt/ngrx';
...
  newStr$ = new Source<string>('newStr$');
  stringAdapter = createAdapter<string>()({
    append: (state, newStr: string) => state + newStr,
  });
  stringStore = this.adapt.init(['string', this.stringAdapter, ''], {
    append: this.newStr$,
  });
  str$ = this.stringStore.getState();
  constructor(private adapt: Adapt) {
    this.str$.subscribe();
    setTimeout(() => this.newStr$.next('Hello World!'), 3000);
  }
...
```

Open up Redux Devtools and you should see the state update after 3 seconds.

## NGXS

First, `npm install`:

```
npm i -s @state-adapt/core @state-adapt/ngxs reselect
```

Include in your app.module.ts like so:

```typescript
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
import { AdaptState } from '@state-adapt/ngxs';
```

In your module imports array:

```typescript
    NgxsModule.forRoot([AdaptState], {
      developmentMode: !environment.production
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production,
      actionSanitizer,
      stateSanitizer,
    }),
```

Now you can use it in a component or service. Here's an example in a component:

```typescript
import { Source, createAdapter } from '@state-adapt/core';
import { Adapt } from '@state-adapt/ngxs';
...
  newStr$ = new Source<string>('newStr$');
  stringAdapter = createAdapter<string>()({
    append: (state, newStr: string) => state + newStr,
  });
  stringStore = this.adapt.init(['string', this.stringAdapter, ''], {
    append: this.newStr$,
  });
  str$ = this.stringStore.getState();
  constructor(private adapt: Adapt) {
    this.str$.subscribe();
    setTimeout(() => this.newStr$.next('Hello World!'), 3000);
  }
...
```

Open up Redux Devtools and you should see the state update after 3 seconds.

# React with Redux

First, `npm install`:

```
npm i -s @state-adapt/core @state-adapt/react
```

Define your adapt store:

```typescript
import {
  actionSanitizer,
  stateSanitizer,
  createStore,
} from '@state-adapt/core';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});
export const adapt = createStore(enableReduxDevTools);
```

Provide StateAdapt in your app context:

```tsx
import { AdaptContext } from '@state-adapt/react';
import { adapt, store } from './store';
// ...
  <AdaptContext.Provider value={adapt}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AdaptContext.Provider>,
```

And now you can use it in your components:

```tsx
import { createAdapter } from '@state-adapt/core';
import { useSource, useAdapter, useObservable } from '@state-adapt/react';

const stringAdapter = createAdapter<string>()({
  append: (state, newStr: string) => state + newStr,
});

export function App() {
  const newStr$ = useSource<string>('newStr$');
  const stringStore = useAdapter(['string', stringAdapter, ''], {
    append: this.newStr$,
  });
  cost str$ = stringStore.getState();
  const str = useObservable(str$);

  return (
    <h1>{str}</h1>
    <button onClick={() => newStr$.next('new string ')}>New String</button>
  )
}
```

# React with Redux

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
import { createAdapter } from '@state-adapt/core';
import { useSource, useAdapter, useObservable } from '@state-adapt/react';

const stringAdapter = createAdapter<string>()({
  append: (state, newStr: string) => state + newStr,
});

export function App() {
  const newStr$ = useSource<string>('newStr$');
  const stringStore = useAdapter(['string', stringAdapter, ''], {
    append: this.newStr$,
  });
  cost str$ = stringStore.getState();
  const str = useObservable(str$);

  return (
    <h1>{str}</h1>
    <button onClick={() => newStr$.next('new string ')}>New String</button>
  )
}
```

# GitHub

[GitHub repository](https://github.com/state-adapt/state-adapt)
