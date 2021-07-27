import { CommonModule } from '@angular/common';
import { NgModule, SecurityContext } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AdapterDocsModule } from '@state-adapt/adapter-docs';
import {
  actionSanitizer,
  AdaptCommon,
  createStore,
  stateSanitizer,
} from '@state-adapt/core';
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

import { AdaptersCoreComponent } from './adapters/adapters-core.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CircuitsComponent } from './circuits/circuits.component';
import { AdaptersComponent } from './concepts/adapters.component';
import { NavTileComponent } from './concepts/nav-tile.component';
import { ConceptsOverviewComponent } from './concepts/overview.component';
import { SourcesComponent } from './concepts/sources.component';
import { StoresComponent } from './concepts/stores.component';
import { ThinkingReactivelyComponent } from './concepts/thinking-reactively.component';
import { ContentComponent } from './content.component';
import { DemosComponent } from './demos/demos.component';
import { getMarkedOptions } from './get-marked-options.function';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { IntroComponent } from './intro/intro.component';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

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
    AdapterDocsModule,
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
    AdaptersCoreComponent,
  ],
  providers: [
    { provide: AdaptCommon, useValue: createStore(enableReduxDevTools) },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
