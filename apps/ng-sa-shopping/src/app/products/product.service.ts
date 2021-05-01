import { Injectable } from '@angular/core';
import { AdaptCommon, joinSelectors, Source } from '@state-adapt/core';
import {
  Product,
  products,
  QuantityChange,
} from '../../../../../libs/shopping/src';
import { FilterService } from '../filters/filter.service';
import { productAdapter } from './product.adapter';
import { getFilteredProducts } from './filter-product.selectors';

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
  filteredProductStore = joinSelectors(
    this.filterStore,
    this.productStore,
    getFilteredProducts,
  );

  constructor(
    private adapt: AdaptCommon<any>,
    private filterService: FilterService,
  ) {}
}
