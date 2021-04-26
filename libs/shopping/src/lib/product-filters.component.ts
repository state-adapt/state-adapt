import { Component } from '@angular/core';

@Component({
  selector: 'state-adapt-product-filters',
  template: `
    <ibm-checkbox>Under $1</ibm-checkbox>
    <ibm-checkbox>$1 to $2</ibm-checkbox>
    <ibm-checkbox>$2 to $3</ibm-checkbox>
    <ibm-checkbox>$3 & Above</ibm-checkbox>
  `,
  styles: [
    `
      :host {
        padding: 14px;
      }
    `,
  ],
})
export class ProductFiltersComponent {}
