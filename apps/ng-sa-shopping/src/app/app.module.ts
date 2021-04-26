import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ShoppingSharedModule } from '../../../../libs/shopping/src';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, ShoppingSharedModule],
  bootstrap: [AppComponent],
  declarations: [AppComponent],
})
export class AppModule {}
