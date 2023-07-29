import { Component, inject } from '@angular/core';
import {
  ProductService,
  injectCartStore,
  productSources,
} from './products/product.service';
import { injectFilterStore } from './filters/filter.service';

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
  quantityChange$ = productSources.quantityChange$;
  addToCart$ = productSources.addToCart$;
  removeFromCart$ = productSources.removeFromCart$;
  cartProducts$ = injectCartStore().state$;
  cartTotal$ = injectCartStore().totalPrice$;

  toggleFilter = injectFilterStore().toggleFilter;
  filters$ = injectFilterStore().state$;

  filteredProducts$ = inject(ProductService).filteredProductStore.filteredProducts$;
}
