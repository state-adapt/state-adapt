## Angular

<!-- TODO: Fix the Schematic publishing -->
<!-- First, add StateAdapt to your project using `ng add`:

```sh
ng add @state-adapt/angular
```

::: info Alternatively, install manually: -->

First, install:

```sh
npm i -s @state-adapt/core
npm i -s @state-adapt/rxjs
npm i -s @state-adapt/angular
```

<!-- ::: -->

Then include in `main.ts`:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { defaultStoreProvider } from '@state-adapt/angular';

import { AppComponent } from './app.component';

bootstrapApplication(AppComponent, {
  providers: [defaultStoreProvider], // [!code ++]
});
```

---

For options, see [@state-adapt/angular](/api/angular/index/provideStore.html).

[StackBlitz Starter](https://stackblitz.com/edit/state-adapt-angular?file=src%2Fapp%2Fapp.module.ts)

## With NgRx/Store

::: info You probably don't need this.
This enables

1. Redux Devtools to sync and show both stores' states together
2. Selecting from both global states. StateAdapt's state is nested in a hidden top-level `adapt` reducer.

:::

::: danger DEPRECATED
The @state-adapt/ngrx library is deprecated and will be removed in StateAdapt v4.

If you still need it, copy the files from `https://github.com/state-adapt/state-adapt/tree/main/libs/ngrx/src/lib`
into your project and use them directly.
:::

First, install:

```sh
npm i -s @state-adapt/{core,rxjs,angular,ngrx}
```

Add to the root NgRx/Store config:

```ts
import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { adaptReducer, actionSanitizer, stateSanitizer } from '@state-adapt/core'; // [!code ++]

import { AppComponent } from './app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideStore({
      count: counterReducer,
      adapt: adaptReducer, // [!code ++]
    }),
    provideStoreDevtools({
      logOnly: !isDevMode(),
      actionSanitizer, // [!code ++]
      stateSanitizer, // [!code ++]
    }),
  ],
});
```

Now in a component or service:

```typescript
import { adaptNgrx } from '@state-adapt/ngrx';
// ...
nameStore = adaptNgrx('Bob');
```

[StackBlitz Starter](https://stackblitz.com/edit/stackblitz-starters-izjelthh?description=An%20angular-cli%20project%20based%20on%20@angular/animations,%20@angular/common,%20@angular/compiler,%20@angular/core,%20@angular/forms,%20@angular/platform-browser,%20@angular/platform-browser-dynamic,%20@angular/router,%20core-js,%20rxjs,%20tslib%20and%20zone.js&file=src%2Fmain.ts,src%2Fapp.component.ts,src%2Fcounter.component.ts&template=node&title=Angular%20Starter)

## Angular with NGXS

::: info You probably don't need this.
This enables

1. Redux Devtools to sync and show both stores' states together
2. Selecting from both global states. StateAdapt's state is nested in a hidden top-level `adapt` reducer.

:::

::: danger DEPRECATED
The @state-adapt/ngxs library is deprecated and will be removed in StateAdapt v3.1.

If you still need it, copy the files from `https://github.com/state-adapt/state-adapt/tree/main/libs/ngxs/src/lib`
into your project and use them directly.
:::

First, install:

```sh
npm i -s @state-adapt/{core,rxjs,angular,ngxs}
```

Then include in `main.ts`:

```ts
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
+import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
+import { AdaptState } from '@state-adapt/ngxs';
// ...
// In your module imports array:
    NgxsModule.forRoot(
      [AdaptState],
      {
        developmentMode: !environment.production // [!code ++]
      },
    ),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production,
      actionSanitizer, // [!code ++]
      stateSanitizer, // [!code ++]
    }),


```

Now in a component or service:

```typescript
import { adaptNgxs } from '@state-adapt/ngxs';
// ...
nameStore = adaptNgxs('Bob');
```
