import { Filters } from './filters.interface';

export type FilterFunctions = {
  [P in keyof Filters]: (price: number) => boolean;
};

export const filterFunctions: FilterFunctions = {
  under1: price => price <= 1,
  between1and2: price => price >= 1 && price <= 2,
  between2and3: price => price >= 2 && price <= 3,
  above3: price => price >= 3,
};
