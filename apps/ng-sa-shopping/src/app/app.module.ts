import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  actionSanitizer,
  stateSanitizer,
  createStore,
  AdaptCommon,
} from '@state-adapt/core';
import { ShoppingSharedModule } from '../../../../libs/shopping/src';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, ShoppingSharedModule],
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  providers: [
    { provide: AdaptCommon, useValue: createStore(enableReduxDevTools) },
  ],
})
export class AppModule {}
