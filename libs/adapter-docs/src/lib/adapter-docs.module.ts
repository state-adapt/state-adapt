import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CodeEditorModule } from '@ngstack/code-editor';
import {
  ButtonModule,
  DropdownModule,
  InputModule,
  StructuredListModule,
  TabsModule,
  TilesModule,
} from 'carbon-components-angular';
import { AdapterDocsComponent } from './adapter-docs.component';
import { HtmlComponent } from './html.component';

@NgModule({
  imports: [
    CommonModule,
    StructuredListModule,
    TilesModule,
    ButtonModule,
    DropdownModule,
    TabsModule,
    InputModule,
    CodeEditorModule.forChild(),
    HtmlComponent,
  ],
  declarations: [AdapterDocsComponent],
  exports: [AdapterDocsComponent],
})
export class AdapterDocsModule {}
