import { Component, ViewEncapsulation } from '@angular/core';
import { AdapterDocsModule, HtmlComponent } from '@state-adapt/adapter-docs';
import html from './adapters-core.md';
import { ContentComponent } from '../content.component';
import { createAdapterDocs } from './create-adapter-docs.const';
import { booleanAdapterDocs } from './boolean/boolean-adapter-docs.const';
import { numberAdapterDocs } from './number/number-adapter-docs.const';
import { stringAdapterDocs } from './string/string-adapter-docs.const';
import { entityAdapterDocs } from './entity/entity-adapter-docs.const';
// https://github.com/ngstack/code-editor/issues/628
export { CodeEditorService } from '@ngstack/code-editor';
export { EditorReadyService } from '@state-adapt/adapter-docs';

@Component({
  standalone: true,
  selector: 'sa-adapters-core',
  encapsulation: ViewEncapsulation.None,
  imports: [AdapterDocsModule, ContentComponent, HtmlComponent],
  template: `
    <sa-content>
      <sa-html [html]="html"></sa-html>
      <sa-adapter-docs [adapterDocs]="createAdapterDocs"></sa-adapter-docs>
      <sa-adapter-docs [adapterDocs]="booleanAdapterDocs"></sa-adapter-docs>
      <sa-adapter-docs [adapterDocs]="numberAdapterDocs"></sa-adapter-docs>
      <sa-adapter-docs [adapterDocs]="stringAdapterDocs"></sa-adapter-docs>
      <sa-adapter-docs [adapterDocs]="entityAdapterDocs"></sa-adapter-docs>
    </sa-content>
  `,
  styleUrls: ['styles.scss'],
})
export class AdaptersCoreComponent {
  html = html;
  createAdapterDocs = createAdapterDocs;
  booleanAdapterDocs = booleanAdapterDocs;
  numberAdapterDocs = numberAdapterDocs;
  stringAdapterDocs = stringAdapterDocs;
  entityAdapterDocs = entityAdapterDocs;
}
