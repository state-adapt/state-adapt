---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/provide-store.function.ts#L58
---

# Function: provideStore()

> **provideStore**(`options?`): `object`

Defined in: [lib/provide-store.function.ts:58](https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/provide-store.function.ts#L58)

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

### options?

[`ConfigureStateAdaptOptions`](../../rxjs/index/ConfigureStateAdaptOptions.md)

## Returns

`object`

### provide

> **provide**: `InjectionToken`\<[`StateAdapt`](../../rxjs/index/StateAdapt.md)\<`any`\>\> = `StateAdaptToken`

### useFactory()

> **useFactory**: () => `Pick`\<[`StateAdapt`](../../rxjs/index/StateAdapt.md)\<`any`\>, `"adapt"` \| `"watch"`\>

#### Returns

`Pick`\<[`StateAdapt`](../../rxjs/index/StateAdapt.md)\<`any`\>, `"adapt"` \| `"watch"`\>
