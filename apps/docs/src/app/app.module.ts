import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { defaultStoreProvider } from '@state-adapt/angular';
import { IconModule } from 'carbon-components-angular/icon';
import { ButtonModule } from 'carbon-components-angular/button';
import { UIShellModule } from 'carbon-components-angular/ui-shell';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContentComponent } from './content.component';
import { IntroComponent } from './intro/intro.component';
import { HtmlComponent } from '@state-adapt/adapter-docs';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    UIShellModule,
    ButtonModule,
    IconModule,
    ContentComponent,
    HtmlComponent,
  ],
  declarations: [AppComponent, IntroComponent],
  providers: [defaultStoreProvider],
  bootstrap: [AppComponent],
})
export class AppModule {}
