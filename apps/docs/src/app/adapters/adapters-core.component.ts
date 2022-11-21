import { Component, ViewEncapsulation } from '@angular/core';
import { AdapterDocsModule } from '@state-adapt/adapter-docs';
import { MarkdownModule } from 'ngx-markdown';
import md from 'raw-loader!./adapters-core.md';
import { ContentComponent } from '../content.component';
import { createAdapterDocs } from './create-adapter-docs.const';
import { booleanAdapterDocs } from './boolean/boolean-adapter-docs.const';
import { numberAdapterDocs } from './number/number-adapter-docs.const';
import { stringAdapterDocs } from './string/string-adapter-docs.const';
// https://github.com/ngstack/code-editor/issues/628
export { CodeEditorService } from '@ngstack/code-editor';
export { EditorReadyService } from '@state-adapt/adapter-docs';

@Component({
  standalone: true,
  selector: 'sa-adapters-core',
  encapsulation: ViewEncapsulation.None,
  imports: [AdapterDocsModule, ContentComponent, MarkdownModule],
  template: `
    <sa-content>
      <markdown [data]="md"></markdown>
      <sa-adapter-docs [adapterDocs]="createAdapterDocs"></sa-adapter-docs>
      <sa-adapter-docs [adapterDocs]="booleanAdapterDocs"></sa-adapter-docs>
      <sa-adapter-docs [adapterDocs]="numberAdapterDocs"></sa-adapter-docs>
      <sa-adapter-docs [adapterDocs]="stringAdapterDocs"></sa-adapter-docs>
    </sa-content>
  `,
  styleUrls: ['styles.scss'],
})
export class AdaptersCoreComponent {
  md = md;
  createAdapterDocs = createAdapterDocs;
  booleanAdapterDocs = booleanAdapterDocs;
  numberAdapterDocs = numberAdapterDocs;
  stringAdapterDocs = stringAdapterDocs;
}
