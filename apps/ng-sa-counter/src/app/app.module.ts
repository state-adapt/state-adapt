import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  actionSanitizer,
  stateSanitizer,
  createStore,
  AdaptCommon,
} from '@state-adapt/core';
import { CounterUiModule } from '../../../../libs/counter-ui/src';

import { AppComponent } from './app.component';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

@NgModule({
  imports: [BrowserModule, CounterUiModule],
  declarations: [AppComponent],
  providers: [
    { provide: AdaptCommon, useValue: createStore(enableReduxDevTools) },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
