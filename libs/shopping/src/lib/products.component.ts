import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from './product.interface';

@Component({
  selector: 'state-adapt-products',
  template: `
    <state-adapt-product
      *ngFor="let product of products"
      [product]="product"
      (inCartChange)="itemAdded.emit(product.name)"
    ></state-adapt-product>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-wrap: wrap;
        gap: 30px;
        padding: 14px;
      }
      state-adapt-product {
        display: flex;
        width: 200px;
      }
    `,
  ],
})
export class ProductsComponent {
  @Input() products: Product[] = [];
  @Output() itemAdded = new EventEmitter<string>();
}
