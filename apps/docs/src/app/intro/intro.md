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

# Demo Apps

- [Angular Reactive Forms with NgRx and StateAdapt](https://stackblitz.com/edit/angular-reactive-forms-state-management?file=src%2Fapp%2Fform%2Fstate-adapt-form.component.ts)

# Getting Started

Set up StateAdapt with

- [Angular](#angular)
- [Angular and NgRx](#angular-and-ngrx)
- [Angular and NGXS](#angular-and-ngxs)
- [React](#react)
- [React and Redux](#react-and-redux)

## Angular

[StackBlitz Demo](https://stackblitz.com/github/state-adapt/state-adapt/tree/stackblitz-ng-sa-counter?file=apps%2Fng-sa-counter%2Fsrc%2Fapp%2Fapp.module.ts)

First, `npm install`:

```
npm i -s @state-adapt/core reselect
```

Include in app.module.ts like so:

```typescript
import {
  createStore,
  actionSanitizer,
  stateSanitizer,
  AdaptCommon,
} from '@state-adapt/core';
// ...
// Create the Adapt store:
const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});
// ...
// Provide it:
    providers: [{provide: AdaptCommon, useValue: createStore(enableReduxDevTools)}],
```

Now you can use it in a component or service. Here's an example in a component:

```typescript
import { Source, createAdapter, AdaptCommon } from '@state-adapt/core';
...
  newStr$ = new Source<string>('newStr$');
  stringAdapter = createAdapter<string>()({
    append: (state, newStr: string) => state + newStr,
  });
  stringStore = this.adapt.init(['string', this.stringAdapter, ''], {
    append: this.newStr$,
  });
  str$ = this.stringStore.getState();
  constructor(private adapt: AdaptCommon<any>) {
    this.str$.subscribe();
    setTimeout(() => this.newStr$.next('Hello World!'), 3000);
  }
...
```

Open up Redux Devtools and you should see the state update after 3 seconds.

## Angular and NgRx

[StackBlitz Demo](https://stackblitz.com/github/state-adapt/state-adapt/tree/stackblitz-ng-sa-ngrx-counter?file=apps%2Fng-sa-ngrx-counter%2Fsrc%2Fapp%2Fapp.module.ts)

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

## Angular and NGXS

[StackBlitz Demo](https://stackblitz.com/github/state-adapt/state-adapt/tree/stackblitz-ng-sa-ngxs-counter?file=apps%2Fng-sa-ngxs-counter%2Fsrc%2Fapp%2Fapp.module.ts)

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

# React

[StackBlitz Demo](https://stackblitz.com/edit/state-adapt-react)

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

# React and Redux

[StackBlitz Demo](https://stackblitz.com/edit/state-adapt-react-with-redux)

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
