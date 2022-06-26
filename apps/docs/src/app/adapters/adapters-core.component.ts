import { createAdapterDocs } from './create-adapter-docs.const';
import { Component } from '@angular/core';

@Component({
  selector: 'state-adapt-adapters-core',
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
