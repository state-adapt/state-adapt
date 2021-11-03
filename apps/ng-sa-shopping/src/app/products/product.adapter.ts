import { createAdapter } from '@state-adapt/core';
import { Product, QuantityChange } from '../../../../../libs/shopping/src';

export const productAdapter = createAdapter<Product[]>()({
  changeQuantity: (state, { name, quantity }: QuantityChange) =>
    state.map(product => (product.name === name ? { ...product, quantity } : product)),
  addProduct: (state, product: Product) => [...state, product],
  removeProduct: (state, { name }: Product) =>
    state.filter(product => product.name !== name),
  selectors: {
    totalPrice: products =>
      products.reduce((total, { price, quantity }) => total + price * quantity, 0),
  },
});
