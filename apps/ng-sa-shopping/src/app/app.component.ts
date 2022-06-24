import { Component } from '@angular/core';
import { ProductService } from './products/product.service';
import { FilterService } from './filters/filter.service';

@Component({
  selector: 'state-adapt-root',
  template: `
    <state-adapt-shopping>
      <state-adapt-product-filters
        [filters]="filters$ | async"
        (filterToggle)="toggleFilter($event)"
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
  cartProducts$ = this.productService.cartStore.state$;
  cartTotal$ = this.productService.cartStore.totalPrice$;

  toggleFilter = this.filterService.filterStore.toggleFilter;
  filters$ = this.filterService.filterStore.state$;

  filteredProducts$ = this.productService.filteredProductStore.state$;

  constructor(
    private productService: ProductService,
    private filterService: FilterService,
  ) {}
}
