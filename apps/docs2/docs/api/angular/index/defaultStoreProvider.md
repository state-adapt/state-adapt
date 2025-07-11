# Variable: defaultStoreProvider

> `const` **defaultStoreProvider**: `object`

Defined in: [lib/default-store-provider.const.ts:55](https://github.com/state-adapt/state-adapt/blob/4ff8540684d6d76a52452612f8fa44ffd7c6016a/libs/angular/src/lib/default-store-provider.const.ts#L55)

`defaultStoreProvider` is the default provider for [StateAdapt](../../rxjs/index/StateAdapt.md), and
is the easiest way to get started with StateAdapt in Angular. Simply add
`defaultStoreProvider` to your `providers` array in your `AppModule` or `main.ts` file,
and you can use [adapt](adapt.md) and [watch](watch.md) in your components and services.

Use [provideStore](provideStore.md) for more advanced configuration.

#### Example: Using `defaultStoreProvider` for basic setup

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { defaultStoreProvider } from '@state-adapt/angular';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule],
  declarations: [AppComponent],
  providers: [defaultStoreProvider],
})
export class AppModule {}
```

#### Example: Using `defaultStoreProvider` in a main.ts file

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { defaultStoreProvider } from '@state-adapt/angular';

import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    defaultStoreProvider,
    // ...
  ]
});
```

## Type declaration

### provide

> **provide**: *typeof* [`StateAdapt`](../../rxjs/index/StateAdapt.md) = `StateAdapt`

### useValue

> **useValue**: `Pick`\<[`StateAdapt`](../../rxjs/index/StateAdapt.md)\<`any`\>, `"adapt"` \| `"watch"`\>
