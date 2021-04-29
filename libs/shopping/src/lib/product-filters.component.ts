import { Component, EventEmitter, Input, Output } from '@angular/core';
import { filters } from './filters';
import { Filters } from './filters.interface';

@Component({
  selector: 'state-adapt-product-filters',
  template: `
    <ibm-checkbox
      [checked]="filters.under1"
      (checkedChange)="filterToggle.emit('under1')"
      >Under $1</ibm-checkbox
    >
    <ibm-checkbox
      [checked]="filters.between1and2"
      (checkedChange)="filterToggle.emit('between1and2')"
      >$1 to $2</ibm-checkbox
    >
    <ibm-checkbox
      [checked]="filters.between2and3"
      (checkedChange)="filterToggle.emit('between2and3')"
      >$2 to $3</ibm-checkbox
    >
    <ibm-checkbox
      [checked]="filters.above3"
      (checkedChange)="filterToggle.emit('above3')"
      >$3 & Above</ibm-checkbox
    >
  `,
  styles: [
    `
      :host {
        padding: 14px;
      }
    `,
  ],
})
export class ProductFiltersComponent {
  @Input() filters: Filters = filters;
  @Output() filterToggle = new EventEmitter<string>();
}
