import { Component } from '@angular/core';
import { ProductService } from './products/product.service';
import { FilterService } from './filters/filter.service';

@Component({
  selector: 'state-adapt-root',
  template: `
    <state-adapt-shopping>
      <state-adapt-product-filters
        [filters]="filters$ | async"
        (filterToggle)="filterToggle$.next($event)"
      ></state-adapt-product-filters>
      <state-adapt-products
        [products]="filteredProducts$ | async"
        (quantityChange)="quantityChange$.next($event)"
        (inCartChange)="addToCart$.next($event)"
      ></state-adapt-products>
      <state-adapt-cart
        [products]="cartProducts$ | async"
        [total]="cartTotal$ | async"
        (inCartChange)="removeFromCart$.next($event)"
        (quantityChange)="quantityChange$.next($event)"
      ></state-adapt-cart>
    </state-adapt-shopping>
  `,
})
export class AppComponent {
  quantityChange$ = this.productService.quantityChange$;
  addToCart$ = this.productService.addToCart$;
  removeFromCart$ = this.productService.removeFromCart$;
  cartProducts$ = this.productService.cartStore.getState();
  cartTotal$ = this.productService.cartStore.getTotalPrice();

  filterToggle$ = this.filterService.filterToggle$;
  filters$ = this.filterService.filterStore.getState();

  filteredProducts$ = this.productService.filteredProductStore.getState();

  constructor(
    private productService: ProductService,
    private filterService: FilterService,
  ) {}
}
