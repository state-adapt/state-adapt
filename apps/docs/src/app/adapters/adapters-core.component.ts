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
  selector: 'state-adapt-adapters-core',
  encapsulation: ViewEncapsulation.None,
  imports: [AdapterDocsModule, ContentComponent, MarkdownModule],
  template: `
    <state-adapt-content>
      <markdown [data]="md"></markdown>
      <state-adapt-adapter-docs
        [adapterDocs]="createAdapterDocs"
      ></state-adapt-adapter-docs>
      <state-adapt-adapter-docs
        [adapterDocs]="booleanAdapterDocs"
      ></state-adapt-adapter-docs>
      <state-adapt-adapter-docs
        [adapterDocs]="numberAdapterDocs"
      ></state-adapt-adapter-docs>
      <state-adapt-adapter-docs
        [adapterDocs]="stringAdapterDocs"
      ></state-adapt-adapter-docs>
    </state-adapt-content>
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
