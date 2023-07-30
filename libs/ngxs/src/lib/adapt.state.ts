import { Injectable } from '@angular/core';
import { State, StateContext, Action } from '@ngxs/store';
import { updatePaths } from '../../../../libs/core/src';
import { PatchState } from './patch-state.action';

export interface AdaptModel {
  [index: string]: any;
}

/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `AdaptState`

  `AdaptState` is a custom NGXS [state](https://www.ngxs.io/concepts/state) that is used to store the state from StateAdapt.

  #### Example: Using `AdaptState` in an AppModule

  ```ts
  import { NgModule } from '@angular/core';
  import { BrowserModule } from '@angular/platform-browser';
  import { NgxsModule } from '@ngxs/store';
  import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
  import { AdaptState } from '../../../../libs/ngxs/src';
  import { actionSanitizer, stateSanitizer } from '../../../../libs/core/src';

  import { AppComponent } from './app.component';

  @NgModule({
    imports: [
      BrowserModule,
      NgxsModule.forRoot([AdaptState], {
        developmentMode: true,
      }),
      NgxsReduxDevtoolsPluginModule.forRoot({
        actionSanitizer,
        stateSanitizer,
      }),
    ],
    declarations: [AppComponent],
  })
  export class AppModule {}
  ```

  #### Example: Using `AdaptState` in a main.ts file

  ```ts
  import { importProvidersFrom } from '@angular/core';
  import { bootstrapApplication } from '@angular/platform-browser';
  import { NgxsModule } from '@ngxs/store';
  import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
  import { AdaptState } from '../../../../libs/ngxs/src';
  import { actionSanitizer, stateSanitizer } from '../../../../libs/core/src';

  import { AppComponent } from './app/app.component';

  bootstrapApplication(AppComponent, {
    providers: [
      importProvidersFrom(NgxsModule.forRoot([AdaptState], { developmentMode: true })),
      importProvidersFrom(NgxsReduxDevtoolsPluginModule.forRoot({ actionSanitizer, stateSanitizer })),
      // ...
    ]
  });
  ```
 */
@Injectable()
@State<AdaptModel>({
  name: 'adapt',
  defaults: {} as AdaptModel,
})
export class AdaptState {
  @Action(PatchState)
  patchState(
    { getState, patchState }: StateContext<AdaptModel>,
    { payload }: PatchState,
  ) {
    return patchState(updatePaths(getState(), payload));
  }
}
