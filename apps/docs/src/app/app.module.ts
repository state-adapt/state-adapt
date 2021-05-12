import { NgModule, SecurityContext } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import {
  ButtonModule,
  CheckboxModule,
  DatePickerModule,
  ListModule,
  PanelModule,
  TilesModule,
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
import { NavTileComponent } from './concepts/nav-tile.component';
import { ConceptsOverviewComponent } from './concepts/overview.component';
import { SourcesComponent } from './concepts/sources.component';
import { AdaptersComponent } from './concepts/adapters.component';
import { StoresComponent } from './concepts/stores.component';
import { ThinkingReactivelyComponent } from './concepts/thinking-reactively.component';

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
    ListModule,
    TilesModule,
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useFactory: getMarkedOptions,
      },
      sanitize: SecurityContext.NONE,
    }),
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
    NavTileComponent,
    ConceptsOverviewComponent,
    SourcesComponent,
    AdaptersComponent,
    StoresComponent,
    ThinkingReactivelyComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
