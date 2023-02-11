import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ShoppingSharedModule } from '../../../../libs/shopping/src';
import { defaultStoreProvider } from '@state-adapt/angular';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, ShoppingSharedModule],
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  providers: [defaultStoreProvider],
})
export class AppModule {}
