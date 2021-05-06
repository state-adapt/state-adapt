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
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import {
  adaptReducer,
  actionSanitizer,
  stateSanitizer,
} from '@state-adapt/core';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContentComponent } from './content.component';
import { IntroComponent } from './intro/intro.component';
import { getMarkedOptions } from './get-marked-options.function';
import { CircuitsComponent } from './circuits/circuits.component';
import { DemosComponent } from './demos/demos.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { ConceptsOverviewComponent } from './concepts/overview.component';
import { SourcesComponent } from './concepts/sources.component';

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
    StoreModule.forRoot({ adapt: adaptReducer }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      actionSanitizer,
      stateSanitizer,
    }),
  ],
  declarations: [
    AppComponent,
    ContentComponent,
    IntroComponent,
    CircuitsComponent,
    DemosComponent,
    GettingStartedComponent,
    ConceptsOverviewComponent,
    SourcesComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
