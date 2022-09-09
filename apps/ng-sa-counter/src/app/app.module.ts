import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { defaultStoreProvider } from '@state-adapt/angular';
import { CounterUiModule } from '../../../../libs/counter-ui/src';
import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, CounterUiModule],
  declarations: [AppComponent],
  providers: [defaultStoreProvider],
  bootstrap: [AppComponent],
})
export class AppModule {}
