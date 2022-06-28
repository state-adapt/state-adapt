import { Component } from '@angular/core';
import { AdapterDocsModule } from '@state-adapt/adapter-docs';
import { ContentComponent } from '../content.component';
import { createAdapterDocs } from './create-adapter-docs.const';
// https://github.com/ngstack/code-editor/issues/628
export { CodeEditorService } from '@ngstack/code-editor';
export { EditorReadyService } from '@state-adapt/adapter-docs';

@Component({
  standalone: true,
  selector: 'state-adapt-adapters-core',
  imports: [AdapterDocsModule, ContentComponent],
  template: `
    <state-adapt-content>
      <h1>Core Adapters</h1>
      <state-adapt-adapter-docs [adapterDocs]="adapterDocs"></state-adapt-adapter-docs>
    </state-adapt-content>
  `,
})
export class AdaptersCoreComponent {
  adapterDocs = createAdapterDocs;
}
