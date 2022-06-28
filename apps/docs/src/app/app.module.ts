import { NgModule, SecurityContext } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  actionSanitizer,
  AdaptCommon,
  createStore,
  stateSanitizer,
} from '@state-adapt/core';
import { ButtonModule, UIShellModule } from 'carbon-components-angular';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CircuitsComponent } from './circuits/circuits.component';
import { ContentComponent } from './content.component';
import { getMarkedOptions } from './get-marked-options.function';
import { IntroComponent } from './intro/intro.component';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    UIShellModule,
    ButtonModule,
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useFactory: getMarkedOptions,
      },
      sanitize: SecurityContext.NONE,
    }),
    ContentComponent,
  ],
  declarations: [AppComponent, IntroComponent, CircuitsComponent],
  providers: [{ provide: AdaptCommon, useValue: createStore(enableReduxDevTools) }],
  bootstrap: [AppComponent],
})
export class AppModule {}
