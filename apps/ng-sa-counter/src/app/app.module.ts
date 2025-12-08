import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CounterUiModule } from '@state-adapt/counter-ui';
import { AppComponent } from './app.component';
import { defaultStoreProvider, provideStore } from '@state-adapt/angular';
import { actionSanitizer, stateSanitizer } from '@state-adapt/core';

const enableReduxDevTools =
  typeof window !== 'undefined' &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
    actionSanitizer,
    stateSanitizer,
  });

@NgModule({
  imports: [BrowserModule, CounterUiModule],
  declarations: [AppComponent],
  // providers: [defaultStoreProvider],
  providers: [provideStore({ devtools: enableReduxDevTools, showSelectors: false })],
  bootstrap: [AppComponent],
})
export class AppModule {}
