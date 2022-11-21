import { Component } from '@angular/core';
import { ProductService } from './products/product.service';
import { FilterService } from './filters/filter.service';

@Component({
  selector: 'sa-root',
  template: `
    <sa-shopping>
      <sa-product-filters
        [filters]="filters$ | async"
        (filterToggle)="toggleFilter($event)"
      ></sa-product-filters>
      <sa-products
        [products]="filteredProducts$ | async"
        (quantityChange)="quantityChange$.next($event)"
        (inCartChange)="addToCart$.next($event)"
      ></sa-products>
      <sa-cart
        [products]="cartProducts$ | async"
        [total]="cartTotal$ | async"
        (inCartChange)="removeFromCart$.next($event)"
        (quantityChange)="quantityChange$.next($event)"
      ></sa-cart>
    </sa-shopping>
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

  filteredProducts$ = this.productService.filteredProductStore.filteredProducts$;

  constructor(
    private productService: ProductService,
    private filterService: FilterService,
  ) {}
}
