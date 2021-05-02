import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from './product.interface';
import { QuantityChange } from './quantity-change.interface';

@Component({
  selector: 'state-adapt-product',
  template: ` <div class="product">
    <div class="grow"></div>
    <img
      [src]="
        'https://raw.githubusercontent.com/state-adapt/state-adapt/2c9783e9f81dfe76d610671025d0ce3acf0fa0a3/libs/shopping/src/lib/assets/' +
        product.img
      "
    />
    <ibm-number
      [label]="product.price | currency | qtyLabel"
      [ngModel]="product.quantity"
      (ngModelChange)="
        quantityChange.emit({ name: product.name, quantity: $event })
      "
    ></ibm-number>
    <button ibmButton="primary" *ngIf="!inCart" (click)="inCartChange.emit()">
      Add to Cart
    </button>
    <button ibmButton="secondary" *ngIf="inCart" (click)="inCartChange.emit()">
      Remove from Cart
    </button>
  </div>`,
  styles: [
    `
      .product {
        text-align: center;
        height: 287px; /* 320px with pomegranate*/
        display: flex;
        flex-direction: column;
      }
      .product > * {
        flex-grow: 0;
      }
      .grow {
        flex-grow: 1;
      }
      img {
        width: 70%;
        margin: auto;
        margin-bottom: 10px;
      }
      .input-row {
        width: 100%;
      }
      ibm-number {
        width: 100%;
      }
      button {
        width: 100%;
      }
    `,
  ],
})
export class ProductComponent {
  @Input() product: Product = {
    name: 'Pineapple',
    img: 'bananas.svg',
    price: 2.75,
    quantity: 1,
  };
  @Input() inCart = false;
  @Output() quantityChange = new EventEmitter<QuantityChange>();
  @Output() inCartChange = new EventEmitter<void>();
}
