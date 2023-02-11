import { SmartStore } from '@state-adapt/rxjs';

export type SelectorsFromStore<Store extends SmartStore<any, any>> = {
  [K in keyof Store['__']['selectors']]: ReturnType<Store['__']['selectors'][K]>;
};

export type ProxyStoreTuple<Store extends SmartStore<any, any>> = [
  SelectorsFromStore<Store>,
  Store,
];
