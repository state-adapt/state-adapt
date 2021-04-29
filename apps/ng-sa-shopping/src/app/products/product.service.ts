import { Injectable } from '@angular/core';
import { AdaptCommon, join, Source } from '@state-adapt/core';
import { createSelector } from 'reselect';
import {
  filterFunctions,
  Filters,
  Product,
  products,
  QuantityChange,
} from '../../../../../libs/shopping/src';
import { FilterService } from '../filters/filter.service';
import { productAdapter } from './product.adapter';

@Injectable({ providedIn: 'root' })
export class ProductService {
  quantityChange$ = new Source<QuantityChange>('[Products] quantityChange$');
  addToCart$ = new Source<Product>('[Products] addToCart$');
  removeFromCart$ = new Source<Product>('[Products] removeFromCart$');

  productStore = this.adapt.init(['products', productAdapter, products], {
    changeQuantity: this.quantityChange$,
    addProduct: this.removeFromCart$,
    removeProduct: this.addToCart$,
  });

  cartStore = this.adapt.init(['cart', productAdapter, []], {
    changeQuantity: this.quantityChange$,
    addProduct: this.addToCart$,
    removeProduct: this.removeFromCart$,
  });

  filterStore = this.filterService.filterStore;
  filteredProductStore = join(
    this.filterStore,
    this.productStore,
    ({ getState: getFilters }, { getState: getProducts }) => ({
      getFilteredProducts: createSelector(
        getFilters,
        getProducts,
        (filters, products) => {
          const activeFilters = Object.entries(filters).filter(
            ([key, val]) => val,
          ) as [keyof Filters, boolean][];
          const filteredProducts = !activeFilters.length
            ? products
            : products.filter(({ price }) =>
                activeFilters.some(([key]) => filterFunctions[key](price)),
              );

          return filteredProducts.sort((a, b) => (a.name > b.name ? 1 : -1));
        },
      ),
    }),
  );

  constructor(
    private adapt: AdaptCommon<any>,
    private filterService: FilterService,
  ) {}
}
