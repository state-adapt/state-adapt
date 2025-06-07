import { StoreLike } from '@state-adapt/rxjs';

export type StoreStates<
  Store extends StoreLike<any, any, any>,
  SelectorNames extends string = Extract<keyof Store['__']['selectors'], string>,
> = {
  [K in keyof Store['__']['selectors'] as K extends SelectorNames
    ? K
    : never]: ReturnType<Store['__']['selectors'][K]>;
};

export type ProxyStoreTuple<
  State,
  Store extends StoreLike<State, any, any>,
  SelectorNames extends string = Extract<keyof Store['__']['selectors'], string>,
> = [StoreStates<Store, SelectorNames>, ((newState: State) => void) & Store];
