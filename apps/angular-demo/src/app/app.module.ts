import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { provideStore } from '@state-adapt/angular';
import { actionSanitizer, stateSanitizer } from '@state-adapt/core';

import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { TickerKeepAliveComponent, TickerLifecycleComponent } from './live';

const enableReduxDevTools =
  typeof window !== 'undefined' &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
    actionSanitizer,
    stateSanitizer,
  });

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    TickerKeepAliveComponent,
    TickerLifecycleComponent,
  ],
  declarations: [AppComponent],
  providers: [provideStore({ devtools: enableReduxDevTools, showSelectors: false })],
  bootstrap: [AppComponent],
})
export class AppModule {}
