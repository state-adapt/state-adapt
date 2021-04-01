import { NgModule, SecurityContext } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import {
  ButtonModule,
  CheckboxModule,
  DatePickerModule,
  ListModule,
  PanelModule,
  UIShellModule,
} from 'carbon-components-angular';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContentComponent } from './content.component';
import { IntroComponent } from './intro/intro.component';
import { getMarkedOptions } from './get-marked-options.function';
import { CircuitsComponent } from './circuits/circuits.component';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    UIShellModule,
    ButtonModule,
    CheckboxModule,
    DatePickerModule,
    PanelModule,
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useFactory: getMarkedOptions,
      },
      sanitize: SecurityContext.NONE,
    }),
    ListModule,
  ],
  declarations: [
    AppComponent,
    ContentComponent,
    IntroComponent,
    CircuitsComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
