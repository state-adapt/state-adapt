import { GlobalStore } from './observable-store';

/**
  `ConfigureStateAdaptOptions` has 4 possible properties:
  - `showSelectors?: boolean` (default: `true`) - determines whether to show StateAdapt selectors in Redux DevTools
  - `store`: {@link Store} - Redux-like store
  - `devtools: any` - options for Redux DevTools
  - `preloadedState?: any` -  self-explanatory

  If `store` is provided, `devtools` and `preloadedState` are ignored.
 */
export type ConfigureStateAdaptOptions<
  Store extends GlobalStore<any, any> = GlobalStore<any, any>,
> = { showSelectors?: boolean } & (
  | { store: Store }
  | { devtools: any; preloadedState?: any }
);
