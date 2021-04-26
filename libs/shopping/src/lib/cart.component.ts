import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from './product.interface';

@Component({
  selector: 'state-adapt-cart',
  template: `
    <div class="container">
      <state-adapt-product
        *ngFor="let product of products"
        [inCart]="true"
        [product]="product"
        (inCartChange)="itemRemoved.emit(product.name)"
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
  @Output() itemRemoved = new EventEmitter<string>();
}
