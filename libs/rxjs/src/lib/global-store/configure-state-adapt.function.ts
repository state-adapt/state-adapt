import {
  actionSanitizer,
  adaptReducer,
  createAdaptNestedReducer,
  globalSelectorsOptions,
  stateSanitizer,
} from '@state-adapt/core';
import { StateAdapt } from './state-adapt';
import { GlobalStore, ObservableStore } from './observable-store';
import { createGlobalStore } from '../create-global-store.function';
import { ConfigureStateAdaptOptions } from './configure-state-adapt.options';

function isStoreOptions(options: ConfigureStateAdaptOptions): options is { store: any } {
  return (options as any).store !== undefined;
}

/**
 * @internal
 */
export interface ConfiguredStateAdapt<
  Store extends GlobalStore<any, any> = GlobalStore<any, any>,
> extends Pick<StateAdapt<any>, 'adapt' | 'watch'> {}

/**
  `configureStateAdapt` takes in a {@link ConfigureStateAdaptOptions} object and returns a new instance of {@link StateAdapt}.

  ### Example: Standalone with default options

  ```ts
  import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
  import { configureStateAdapt } from '@state-adapt/rxjs';

  export const stateAdapt = configureStateAdapt();

  export const { adapt, watch } = stateAdapt;
  ```

  ### Example: Standalone

  ```ts
  import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
  import { configureStateAdapt } from '@state-adapt/rxjs';

  export const stateAdapt = configureStateAdapt({
    devtools: (window as any)?.__REDUX_DEVTOOLS_EXTENSION__?.({
      actionSanitizer,
      stateSanitizer,
    }),
    showSelectors: false,
  });

  export const { adapt, watch } = stateAdapt;
  ```

  ### Example: With another store

  ```ts
  import { configureStore } from '@reduxjs/toolkit'; // or any other Redux-like store
  import { configureStateAdapt } from '@state-adapt/rxjs';
  import { reducer } from './reducer';

  const store = configureStore({ reducer });

  export const stateAdapt = configureStateAdapt({ store });

  export const { adapt, watch } = stateAdapt;
  ```
*/
export function configureStateAdapt<
  Store extends GlobalStore<any, any> = GlobalStore<any, any>,
>(
  options: ConfigureStateAdaptOptions<Store> = {
    devtools:
      typeof window !== 'undefined' &&
      (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
        actionSanitizer,
        stateSanitizer,
      }),
  },
): Pick<StateAdapt<any>, 'adapt' | 'watch'> {
  globalSelectorsOptions.devtools = options.showSelectors ?? true;
  const store = isStoreOptions(options)
    ? options.store
    : createGlobalStore(
        createAdaptNestedReducer(adaptReducer),
        options.preloadedState,
        options.devtools,
      );

  const stateAdapt = new StateAdapt(new ObservableStore(store));
  return {
    adapt: stateAdapt.adapt.bind(stateAdapt),
    watch: stateAdapt.watch.bind(stateAdapt),
    ['commonStore' as never]: (stateAdapt as any).commonStore,
  };
}
