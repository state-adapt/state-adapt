import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
import { AdaptState } from '@state-adapt/ngxs';
import { CounterDemoModule } from '../../../../libs/counter-demo/src';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CounterDemoModule,
    NgxsModule.forRoot([AdaptState], {
      developmentMode: !environment.production,
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production,
      actionSanitizer,
      stateSanitizer,
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
