import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from './product.interface';
import { QuantityChange } from './quantity-change.interface';

@Component({
  selector: 'sa-products',
  template: `
    <sa-product
      *ngFor="let product of products"
      [product]="product"
      (inCartChange)="inCartChange.emit(product)"
      (quantityChange)="quantityChange.emit($event)"
    ></sa-product>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-wrap: wrap;
        gap: 30px;
        padding: 14px;
      }
      sa-product {
        display: flex;
        width: 200px;
      }
    `,
  ],
})
export class ProductsComponent {
  @Input() products: Product[] = [];
  @Output() inCartChange = new EventEmitter<Product>();
  @Output() quantityChange = new EventEmitter<QuantityChange>();
}
