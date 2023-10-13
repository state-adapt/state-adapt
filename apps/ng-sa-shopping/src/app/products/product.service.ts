import { Injectable } from '@angular/core';
import { joinStores, Source } from '@state-adapt/rxjs';
import { adaptInjectable } from '@state-adapt/angular';
import { Product, products, QuantityChange } from '../../../../../libs/shopping/src';
import { injectFilterStore } from '../filters/filter.service';
import { getFilteredProducts } from './filter-product.selectors';
import { productAdapter } from './product.adapter';

export const productSources = {
  quantityChange$: new Source<QuantityChange>('[Products] quantityChange$'),
  addToCart$: new Source<Product>('[Products] addToCart$'),
  removeFromCart$: new Source<Product>('[Products] removeFromCart$'),
};

export const injectProductStore = adaptInjectable(products, {
  adapter: productAdapter,
  sources: {
    changeQuantity: productSources.quantityChange$,
    addProduct: productSources.removeFromCart$,
    removeProduct: productSources.addToCart$,
  },
  path: 'products',
});

export const injectCartStore = adaptInjectable([] as Product[], {
  adapter: productAdapter,
  sources: {
    changeQuantity: productSources.quantityChange$,
    addProduct: productSources.addToCart$,
    removeProduct: productSources.removeFromCart$,
  },
  path: 'cart',
});

@Injectable({ providedIn: 'root' })
export class ProductService {
  filteredProductStore = joinStores({
    product: injectProductStore(),
    filter: injectFilterStore(),
  })({
    filteredProducts: s => getFilteredProducts(s.filter, s.product),
  })();
}
