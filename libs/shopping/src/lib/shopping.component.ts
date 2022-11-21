import { Component } from '@angular/core';

@Component({
  selector: 'sa-shopping',
  template: `
    <main>
      <div id="products-container">
        <ng-content select="state-adapt-product-filters"></ng-content>
        <ng-content select="state-adapt-products"></ng-content>
      </div>
      <div id="cart"><ng-content select="state-adapt-cart"></ng-content></div>
    </main>
  `,
  styles: [
    `
      main {
        width: 100%;
        max-width: 1200px;
        margin: auto;
      }

      #products-container,
      #cart {
        min-width: 200px;
        float: left;
      }
      #products-container {
        width: calc(100% - 228px);
      }
      #cart {
        width: 228px;
      }
    `,
  ],
})
export class ShoppingComponent {}
