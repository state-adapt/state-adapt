import { SmartStore } from '../../../../libs/rxjs/src';

export type FilteredStoreSelectors<
  Store extends SmartStore<any, any>,
  SelectorNames extends string = Extract<keyof Store['__']['selectors'], string>,
> = {
  [K in keyof Store['__']['selectors'] as K extends SelectorNames
    ? K
    : never]: ReturnType<Store['__']['selectors'][K]>;
};

export type ProxyStoreTuple<Store extends SmartStore<any, any>> = [
  FilteredStoreSelectors<Store>,
  Store,
];
