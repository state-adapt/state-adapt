import { Component, EventEmitter, Input, Output } from '@angular/core';
import { filters } from './filters';
import { Filters } from './filters.interface';

@Component({
  selector: 'sa-product-filters',
  template: `
    <label>
      <input
        type="checkbox"
        [checked]="filters.under1"
        (change)="filterToggle.emit('under1')"
      />
      Under $1
    </label>
    <label>
      <input
        type="checkbox"
        [checked]="filters.between1and2"
        (change)="filterToggle.emit('between1and2')"
      />
      $1 to $2
    </label>
    <label>
      <input
        type="checkbox"
        [checked]="filters.between2and3"
        (change)="filterToggle.emit('between2and3')"
      />
      $2 to $3
    </label>
    <label>
      <input
        type="checkbox"
        [checked]="filters.above3"
        (change)="filterToggle.emit('above3')"
      />
      $3 & Above
    </label>
  `,
  styles: [
    `
      :host {
        padding: 14px;
      }
      label {
        cursor: pointer;
      }
    `,
  ],
})
export class ProductFiltersComponent {
  @Input() filters: Filters = filters;
  @Output() filterToggle = new EventEmitter<keyof Filters>();
}
