import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideStore } from '@state-adapt/angular';
import { actionSanitizer, stateSanitizer } from '@state-adapt/core';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const enableReduxDevTools =
  typeof window !== 'undefined' &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
    actionSanitizer,
    stateSanitizer,
  });

bootstrapApplication(AppComponent, {
  providers: [provideStore({ devtools: enableReduxDevTools, showSelectors: false })],
}).catch(err => console.error(err));
