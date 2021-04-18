import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { actionSanitizer, stateSanitizer } from '../../../../libs/core/src';
import { ADAPT_SERVICE, DemoUiModule } from '../../../../libs/demo-ui/src';
import { Adapt, AdaptState } from '../../../../libs/ngxs/src';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgxsModule.forRoot([AdaptState], {
      developmentMode: !environment.production,
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production,
      actionSanitizer,
      stateSanitizer,
    }),
    DemoUiModule,
  ],
  providers: [{ provide: ADAPT_SERVICE, useClass: Adapt }],
  bootstrap: [AppComponent],
})
export class AppModule {}
