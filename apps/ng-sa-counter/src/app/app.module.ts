import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ButtonModule } from 'carbon-components-angular';
import {
  actionSanitizer,
  stateSanitizer,
  createStore,
  AdaptCommon,
} from '../../../../libs/core/src';

import { AppComponent } from './app.component';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

@NgModule({
  imports: [BrowserModule, ButtonModule],
  declarations: [AppComponent],
  providers: [
    { provide: AdaptCommon, useValue: createStore(enableReduxDevTools) },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
