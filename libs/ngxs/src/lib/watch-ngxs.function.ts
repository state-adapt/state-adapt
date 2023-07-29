import { inject } from '@angular/core';
import { StateAdapt } from '@state-adapt/rxjs';
import { AdaptNgxs } from './adapt-ngxs.service';

// Differences between adaptNgxs and adaptNgxs jsdoc:
//  - Replace all `rx` with `xs`, case-sensitive // Fix this line after
//  - Replace all `NgRx` with `NGXS`, case-sensitive // Fix this line after
/**
  @deprecated Use for debugging only. Prefer the {@link StateAdapt.adapt} sources syntax that exposes a detached store.

   ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `watchNgxs`

   > Copilot tip: Copy examples into your file or click to definition to open file with context for better Copilot suggestions.

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

  `watchNgxs` is useful in 2 situations primarily: Accessing state without subscribing and accessing state for a source.

  ### Accessing state without subscribing

  `watchNgxs` enables accessing state without subscribing to sources. For example, if your adapter manages the loading state
  for an HTTP request and you need to know if the request is loading before the user is interested in the data,
  `watchNgxs` can give you access to it without triggering the request.

  #### Example: Accessing loading state

  ```tsx
  watchNgxs('data', httpAdapter).loading$.subscribe(console.log);
  ```

  ### Accessing state for a source

  It would be impossible for a source itself to access state from the store without `watchNgxs` because
  it would require using the store before it had been defined. The solution is to use `watchNgxs`
  to access the state needed by `dataReceived$`:

  #### Example: Accessing state for a source

  ```tsx
  export class MyComponent {
    path = 'data'; // Make sure the same path is used in both places

    dataReceived$ = watchNgxs(this.path, dataAdapter).dataNeeded$.pipe(
      filter(needed => needed),
      switchMap(() => this.dataService.fetchData()),
      toSource('dataReceived$'),
    );

    dataStore = adapt([this.path, initialState, dataAdapter], {
      receive: this.dataReceived$,
    });
  }
  ```
*/
export const watchNgxs: StateAdapt['watch'] = <T extends any[]>(...args: T) => {
  const adaptDep = inject(AdaptNgxs); // Needs it from NGXS store
  return (adaptDep.watch as any)(...args);
};
