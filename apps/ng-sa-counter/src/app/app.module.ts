import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  actionSanitizer,
  stateSanitizer,
  createStore,
  AdaptCommon,
} from '@state-adapt/core';
import { CounterDemoModule } from '../../../../libs/counter-demo/src';

import { AppComponent } from './app.component';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

@NgModule({
  imports: [BrowserModule, CounterDemoModule],
  declarations: [AppComponent],
  providers: [
    { provide: AdaptCommon, useValue: createStore(enableReduxDevTools) },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
