import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from './product.interface';

@Component({
  selector: 'state-adapt-product',
  template: ` <div class="product">
    <div class="grow"></div>
    <img [src]="'/assets/' + product.img" />
    <ibm-number
      [label]="product.price | currency | qtyLabel"
      [ngModel]="product.quantity"
      (ngModelChange)="quantityChange.emit($event)"
    ></ibm-number>
    <button
      ibmButton="primary"
      *ngIf="!inCart"
      (click)="inCartChange.emit(true)"
    >
      Add to Cart
    </button>
    <button
      ibmButton="secondary"
      *ngIf="inCart"
      (click)="inCartChange.emit(false)"
    >
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
  @Output() quantityChange = new EventEmitter<number>();
  @Output() inCartChange = new EventEmitter<boolean>();
}
