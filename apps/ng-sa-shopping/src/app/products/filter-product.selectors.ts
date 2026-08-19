import {
  filterFunctions,
  Filters,
  Product,
} from '@state-adapt/shopping';

export function getFilteredProducts(filters: Filters, products: Product[]) {
  const activeFilters = Object.entries(filters).filter(([, val]) => val) as [
    keyof Filters,
    boolean,
  ][];
  const filteredProducts = !activeFilters.length
    ? products
    : products.filter(({ price }) =>
        activeFilters.some(([key]) => filterFunctions[key](price)),
      );

  return filteredProducts.sort((a, b) => (a.name > b.name ? 1 : -1));
}
