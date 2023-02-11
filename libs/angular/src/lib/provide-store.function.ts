import {
  StateAdapt,
  configureStateAdapt,
  ConfigureStateAdaptOptions,
} from '@state-adapt/rxjs';

/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `provideStore`

  `provideStore` takes in a {@link ConfigureStateAdaptOptions} object and
  returns a provider for {@link StateAdapt} that you can add
  to the `providers` array in your `AppModule` or `main.ts` file to make
  {@link adapt} and {@link watch} available to use in your components and services.

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
 */
export function provideStore(options: ConfigureStateAdaptOptions) {
  return {
    provide: StateAdapt,
    useValue: configureStateAdapt(options),
  };
}
