import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { actionSanitizer } from '@state-adapt/core';
import { ADAPT_SERVICE, DemoUiModule } from '@state-adapt/demo-ui';
import { Adapt, AdaptState } from '@state-adapt/ngxs';
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
    }),
    DemoUiModule,
  ],
  providers: [{ provide: ADAPT_SERVICE, useClass: Adapt }],
  bootstrap: [AppComponent],
})
export class AppModule {}
