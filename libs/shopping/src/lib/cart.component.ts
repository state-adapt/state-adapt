import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from './product.interface';
import { QuantityChange } from './quantity-change.interface';

@Component({
  selector: 'state-adapt-cart',
  template: `
    <div class="container">
      <state-adapt-product
        *ngFor="let product of products"
        [inCart]="true"
        [product]="product"
        (quantityChange)="quantityChange.emit($event)"
        (inCartChange)="inCartChange.emit(product)"
      ></state-adapt-product>
    </div>
    <div class="container">Total: {{ total | currency }}</div>
  `,
  styles: [
    `
      state-adapt-product {
        display: block;
        position: relative;
      }
      button {
        width: 100%;
      }
      .container {
        padding: 14px;
      }
    `,
  ],
})
export class CartComponent {
  @Input() products: Product[] = [];
  @Input() total = 0;
  @Output() inCartChange = new EventEmitter<Product>();
  @Output() quantityChange = new EventEmitter<QuantityChange>();
}
