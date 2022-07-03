import { NgModule, SecurityContext } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  actionSanitizer,
  AdaptCommon,
  createStore,
  stateSanitizer,
} from '@state-adapt/core';
import { IconModule } from 'carbon-components-angular/icon';
import { ButtonModule } from 'carbon-components-angular/button';
import { UIShellModule } from 'carbon-components-angular/ui-shell';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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
    IconModule,
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useFactory: getMarkedOptions,
      },
      sanitize: SecurityContext.NONE,
    }),
    ContentComponent,
  ],
  declarations: [AppComponent, IntroComponent],
  providers: [{ provide: AdaptCommon, useValue: createStore(enableReduxDevTools) }],
  bootstrap: [AppComponent],
})
export class AppModule {}
