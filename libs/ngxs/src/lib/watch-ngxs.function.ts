import { inject } from '@angular/core';
import { StateAdapt } from '@state-adapt/rxjs';
import { AdaptNgxs } from './adapt-ngxs.service';

// Differences between adaptNgxs and adaptNgxs jsdoc:
//  - Replace all `rx` with `xs`, case-sensitive // Fix this line after
//  - Replace all `NgRx` with `NGXS`, case-sensitive // Fix this line after
/**
  `watchNgxs` wraps {@link StateAdapt.watch}, calling `inject(AdaptNgxs)` to get an instance of {@link StateAdapt}
  that uses NGXS for the global store.

  `watchNgxs` returns a detached store (doesn't chain off of sources). This allows you to watch state without affecting anything.
  It takes 2 arguments: The path of the state you are interested in, and the adapter containing the selectors you want to use.

  ```tsx
  watchNgxs(path, adapter)
  ```

  path — Object path in Redux Devtools

  adapter — Object with state change functions and selectors

  ### Usage

  `watchNgxs` enables accessing state without subscribing to sources. For example, if your adapter manages the loading state
  for an HTTP request and you need to know if the request is loading before the user is interested in the data,
  `watchNgxs` can give you access to it without triggering the request.

  #### Example: Accessing loading state

  ```tsx
  watchNgxs('data', httpAdapter).loading$.subscribe(console.log);
  ```
*/
export const watchNgxs: StateAdapt['watch'] = <T extends any[]>(...args: T) => {
  const adaptDep = inject(AdaptNgxs); // Needs it from NGXS store
  return (adaptDep.watch as any)(...args);
};
