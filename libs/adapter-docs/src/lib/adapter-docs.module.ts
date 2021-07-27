import { CommonModule } from '@angular/common';
import { NgModule, SecurityContext } from '@angular/core';
import { CodeEditorModule } from '@ngstack/code-editor';
import {
  ButtonModule,
  DropdownModule,
  InputModule,
  StructuredListModule,
  TabsModule,
  TilesModule,
} from 'carbon-components-angular';
import { MarkdownModule } from 'ngx-markdown';
import { AdapterDocsComponent } from './adapter-docs.component';

@NgModule({
  imports: [
    CommonModule,
    StructuredListModule,
    TilesModule,
    ButtonModule,
    DropdownModule,
    TabsModule,
    InputModule,
    MarkdownModule.forRoot({
      sanitize: SecurityContext.NONE,
    }),
    CodeEditorModule.forRoot(),
  ],
  declarations: [AdapterDocsComponent],
  exports: [AdapterDocsComponent],
})
export class AdapterDocsModule {}
