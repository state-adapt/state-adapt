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
- [StackBlitz: NGXS](https://stackblitz.com/edit/state-adapt-ngxs?file=src/app/app.component.ts)
- [Dashboards Demo App](/dashboards)

# Getting Started

Jump to:

- [NgRx](#ngrx)
- [NGXS](#ngxs)

## NgRx

First, `npm install`:

```
npm install -S @ngrx/store @ngrx/store-devtools @state-adapt/core @state-adapt/ngrx
```

Include in your app.module.ts like so:

```typescript
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
import { adaptReducer } from '@state-adapt/ngrx';
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
npm install -S @ngrx/store @ngxs/store @ngxs/devtools-plugin @state-adapt/core @state-adapt/ngxs
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

# GitHub

[GitHub repository](https://github.com/state-adapt/state-adapt)
