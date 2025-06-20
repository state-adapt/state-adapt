import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { actionSanitizer, stateSanitizer, adaptReducer } from '@state-adapt/core';
import { CounterUiModule } from '../../../../libs/counter-ui/src';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CounterUiModule,
    StoreModule.forRoot({ adapt: adaptReducer }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      actionSanitizer,
      stateSanitizer,
      connectInZone: true,
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
