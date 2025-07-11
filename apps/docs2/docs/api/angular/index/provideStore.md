# Function: provideStore()

> **provideStore**(`options`): `object`

Defined in: [lib/provide-store.function.ts:57](https://github.com/state-adapt/state-adapt/blob/4ff8540684d6d76a52452612f8fa44ffd7c6016a/libs/angular/src/lib/provide-store.function.ts#L57)

`provideStore` takes in a [ConfigureStateAdaptOptions](../../rxjs/index/ConfigureStateAdaptOptions.md) object and
returns a provider for [StateAdapt](../../rxjs/index/StateAdapt.md) that you can add
to the `providers` array in your `AppModule` or `main.ts` file to make
[adapt](adapt.md) and [watch](watch.md) available to use in your components and services.

#### Example: Using `provideStore` in AppModule for devtools setup without selectors

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
import { provideStore } from '@state-adapt/angular';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule],
  declarations: [AppComponent],
  providers: [
    provideStore({
      devtools: (window as any)?.__REDUX_DEVTOOLS_EXTENSION__?.({
        actionSanitizer,
        stateSanitizer,
      }),
      showSelectors: false,
    }),
  ],
})
export class AppModule {}
```

#### Example: Using `provideStore` in a main.ts file for no devtools

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
import { provideStore } from '@state-adapt/angular';

import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideStore({}),
    // ...
  ]
});
```

## Parameters

### options

[`ConfigureStateAdaptOptions`](../../rxjs/index/ConfigureStateAdaptOptions.md)

## Returns

`object`

### provide

> **provide**: *typeof* [`StateAdapt`](../../rxjs/index/StateAdapt.md) = `StateAdapt`

### useValue

> **useValue**: `Pick`\<[`StateAdapt`](../../rxjs/index/StateAdapt.md)\<`any`\>, `"adapt"` \| `"watch"`\>
