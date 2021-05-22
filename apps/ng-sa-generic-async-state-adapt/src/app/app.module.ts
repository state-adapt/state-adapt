import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';

import {
  actionSanitizer,
  AdaptCommon,
  createStore,
  stateSanitizer,
} from '@state-adapt/core';

import { AppComponent } from './app.component';

// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FlexLayoutModule],
  providers: [{ provide: AdaptCommon, useValue: createStore(enableReduxDevTools) },],
  bootstrap: [AppComponent],
})
export class AppModule {
}
