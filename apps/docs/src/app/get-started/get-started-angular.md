## Tutorials

[Basic Syntax](/angular#1-start-with-simple-state)

## Documentation

[@state-adapt/angular](/angular/docs/angular)

[@state-adapt/ngrx](/angular/docs/ngrx)

[@state-adapt/ngxs](/angular/docs/ngxs)

## Setup

[Angular](angular/get-started#angular)

[Angular and NgRx](angular/get-started#angular-and-ngrx)

[Angular and NGXS](angular/get-started#angular-and-ngxs)

### Angular

[StackBlitz Demo](https://stackblitz.com/edit/state-adapt-angular?file=src%2Fapp%2Fapp.module.ts)

First, `npm install`:

```sh
npm i -s @state-adapt/{core,rxjs,angular}
```

Include in `app.module.ts` or `main.ts` like this:

```typescript
import { defaultStoreProvider } from '@state-adapt/angular';
// ...
    providers: [defaultStoreProvider],
```

Now in a component or service:

```typescript
import { adapt } from '@state-adapt/angular';
// ...
stringStore = adapt('Bob');
```

For more configuration options, see [@state-adapt/angular](/docs/angular).

Go to [Tutorials](angular/get-started#tutorials) for help on how to use StateAdapt after setup.

### Angular and NgRx

[StackBlitz Demo](https://stackblitz.com/edit/state-adapt-angular-with-ngrx?file=src%2Fapp%2Fapp.module.ts)

First, `npm install`:

```sh
npm i -s @state-adapt/{core,rxjs,angular,ngrx}
```

Include in `app.module.ts` or `main.ts` like this:

```diff-typescript
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
+import { adaptReducer, actionSanitizer, stateSanitizer } from '@state-adapt/core';
// ...
// In your module imports array:
    StoreModule.forRoot({ adapt: adaptReducer }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
+      actionSanitizer,
+      stateSanitizer,
    }),
```

Now in a component or service:

```typescript
import { adaptNgrx } from '@state-adapt/ngrx';
// ...
nameStore = adaptNgrx('Bob');
```

Go to [Tutorials](angular/get-started#tutorials) for help on how to use StateAdapt after setup.

### Angular and NGXS

[StackBlitz Demo](https://stackblitz.com/edit/state-adapt-angular-with-ngxs?file=src%2Fapp%2Fapp.module.ts)

First, `npm install`:

```sh
npm i -s @state-adapt/{core,rxjs,angular,ngxs}
```

Include in `app.module.ts` or `main.ts` like this:

```diff-typescript
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
+import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
+import { AdaptState } from '@state-adapt/ngxs';
// ...
// In your module imports array:
+    NgxsModule.forRoot([AdaptState], {
      developmentMode: !environment.production
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production,
+      actionSanitizer,
+      stateSanitizer,
    }),
```

Now in a component or service:

```typescript
import { adaptNgxs } from '@state-adapt/ngxs';
// ...
nameStore = adaptNgxs('Bob');
```

Go to [Tutorials](angular/get-started#tutorials) for help on how to use StateAdapt after setup.
