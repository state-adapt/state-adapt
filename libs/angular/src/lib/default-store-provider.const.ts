import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
import { provideStore } from './provide-store.function';
import { StateAdapt } from '@state-adapt/rxjs';
import { adapt } from './adapt.function';
import { watch } from './watch.function';

const enableReduxDevTools =
  typeof window !== 'undefined' &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
    actionSanitizer,
    stateSanitizer,
  });

/**
  `defaultStoreProvider` is the default provider for {@link StateAdapt}, and
  is the easiest way to get started with StateAdapt in Angular. Simply add
  `defaultStoreProvider` to your `providers` array in your `AppModule` or `main.ts` file,
  and you can use {@link adapt} and {@link watch} in your components and services.

  Use {@link provideStore} for more advanced configuration.

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
 */
export const defaultStoreProvider = provideStore({ devtools: enableReduxDevTools });
