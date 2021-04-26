import { NgModule } from '@angular/core';

import {
  actionSanitizer,
  AdaptCommon,
  createStore,
  stateSanitizer,
} from '@state-adapt/core';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    { provide: AdaptCommon, useValue: createStore(enableReduxDevTools) },
  ],
})
export class AppStoreModule {}
