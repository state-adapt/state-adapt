import { Injectable } from '@angular/core';
import { joinStores, Source } from '@state-adapt/rxjs';
import { adapt } from '@state-adapt/angular';
import { Product, products, QuantityChange } from '../../../../../libs/shopping/src';
import { FilterService } from '../filters/filter.service';
import { getFilteredProducts } from './filter-product.selectors';
import { productAdapter } from './product.adapter';

@Injectable({ providedIn: 'root' })
export class ProductService {
  quantityChange$ = new Source<QuantityChange>('[Products] quantityChange$');
  addToCart$ = new Source<Product>('[Products] addToCart$');
  removeFromCart$ = new Source<Product>('[Products] removeFromCart$');

  productStore = adapt(['products', products, productAdapter], {
    changeQuantity: this.quantityChange$,
    addProduct: this.removeFromCart$,
    removeProduct: this.addToCart$,
  });

  cartStore = adapt(['cart', [] as Product[], productAdapter], {
    changeQuantity: this.quantityChange$,
    addProduct: this.addToCart$,
    removeProduct: this.removeFromCart$,
  });

  filteredProductStore = joinStores({
    product: this.productStore,
    filter: this.filterService.filterStore,
  })({
    filteredProducts: s => getFilteredProducts(s.filter, s.product),
  })();

  constructor(private filterService: FilterService) {}
}
