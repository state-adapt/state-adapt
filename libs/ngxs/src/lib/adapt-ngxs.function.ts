import { inject } from '@angular/core';
import { StateAdapt } from '@state-adapt/rxjs';
import { AdaptNgxs } from './adapt-ngxs.service';
import { watchNgxs } from './watch-ngxs.function';
import { Action, Adapter, getId, createAdapter } from '@state-adapt/core';
import { Source } from '@state-adapt/rxjs';

// Differences between adaptNgrx and adaptNgxs jsdoc:
//  - Replace all `rxjs` with `RXJS`, case-sensitive // Fix this line after
//  - Replace all `rx` with `xs`, case-sensitive // Fix this line after
//  - Replace all `RXJS` with `rxjs`, case-sensitive // Fix this line after
//  - Replace all `NgRx` with `NGXS`, case-sensitive // Fix this line after
/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `adaptNgxs`

  > Copilot tip: Copy examples into your file or click to definition to open file with context for better Copilot suggestions.

  `adaptNgxs` wraps {@link StateAdapt.adapt}, calling `inject(AdaptNgxs)` to get an instance of {@link StateAdapt}
  that uses NGXS for the global store.

  `adaptNgxs` creates a store that will manage state while it has subscribers. There are 4 overloads for `adaptNgxs`:

  ### Overloads
  ```javascript
  adaptNgxs(path, initialState)
  adaptNgxs([path, initialState], adapter)
  adaptNgxs([path, initialState], sources)
  adaptNgxs([path, initialState, adapter], sources)
  ```

  path: `string` — Object path in Redux Devtools

  initialState: {@link State} — Initial state of the store when it gets initialized with a subscription to its state

  adapter: {@link Adapter} — Object with state change functions and selectors

  sources:
  - [Observable](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>> — Single source for `set` state change
  - [Observable](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>>[] — Array of sources for `set` state change
  - {@link Sources} — Object specifying sources for state change functions

  ### Overload 1
  `adaptNgxs(path, initialState)`

  The path string specifies the location in the global store you will find the state for the store being created
  (while the store has subscribers). StateAdapt splits this string at periods `'.'` to create an object path within
  the global store. Here are some example paths and the resulting global state objects:

  #### Example: Paths and global state

  ```typescript
  store = adaptNgxs('number', 0);
  sub = this.store.state$.subscribe();
  // global state: { number: 0 }

  store = adaptNgxs('featureA.number', 0);
  sub = this.store.state$.subscribe();
  // global state: { featureA: { number: 0 } }

  store = adaptNgxs('featureA.featureB.number', 0);
  sub = this.store.state$.subscribe();
  // global state: { featureA: { featureB: { number: 0 } } }
  ```

  Each store completely owns its own state. If more than one store tries to use the same path, StateAdapt will throw this error:

  `Path '${path}' collides with '${existingPath}', which has already been initialized as a state path.`

  This applies both to paths that are identical as well as paths that are subtrings of each other. For example, if `'featureA'`
  is already being used by a store and then another store tried to initialize at `'featureA.number'`, that error would be thrown.

  To help avoid this error, StateAdapt provides a {@link getId} function that can be used to generate unique paths:

  #### Example: getId for unique paths

  ```typescript
  import { getId } from '@state-adapt/core';
  // ...
  export class MyComponent {
    store1 = adaptNgxs('number' + getId(), 0);
    sub1 = this.store1.state$.subscribe();

    store2 = adaptNgxs('number' + getId(), 0);
    sub2 = this.store2.state$.subscribe();

    // global state: { number0: 0, number1: 0 }
  }
  ```

  `adaptNgxs` returns a store object that is ready to start managing state once it has subscribers. The store object comes with `set`
  and `reset` methods for updating the state, and a `state$` observable of the store's state.

  #### Example: `set`, `reset` and `state$`

  ```tsx
  export class MyComponent {
    name = adaptNgxs('name', 'John');
    sub = name.state$.subscribe(console.log);

    constructor() {
      this.name.set('Johnsh'); // logs 'Johnsh'
      this.name.reset(); // logs 'John'
    }
  }
  ```

  Usually you won't manually subscribe to state like this, but you can if you want the store to immediately start managing state
  and never clean it up.

  ### Overload 2
  `adaptNgxs([path, initialState], adapter)`

  The adapter is an object such as one created by {@link createAdapter}. It contains methods for updating state,
  called "state changes" or "reactions", and optionally selectors for reading the state. Every reaction function becomes a method on
  the store object, and every selector becomes an observable on the store object.

  #### Example: Inlined adapter

  ```tsx
  export class MyComponent {
    name = adaptNgxs(['name', 'John'], {
      concat: (state, payload: string) => state + payload,
      selectors: {
        length: state => state.length,
      },
    });
    sub1 = name.state$.subscribe(console.log);
    sub2 = name.length$.subscribe(console.log);

    constructor() {
      this.name.concat('sh'); // logs 'Johnsh' and 6
      this.name.reset(); // logs 'John' and 4
    }
  }
  ```

  ### Overload 3
  `adaptNgxs([path, initialState], sources)`

  Sources allow the store to react to external events. There are 4 possible ways sources can be defined:

  1. A source can be a single {@link Source} or [Observable](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>>. When the source emits, it triggers the store's `set` method
  with the payload.

  #### Example: Single source

  ```tsx
  export class MyService {
    nameChange$ = new Source<string>('nameChange$');

    name = adaptNgxs(['name', 'John'], this.nameChange$);

    sub = this.name.state$.subscribe(console.log);

    constructor() {
      this.nameChange$.next('Johnsh'); // logs 'Johnsh'
    }
  }
  ```

  2. A source can be an array of {@link Source} or [Observable](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>>. When any of the sources emit, it triggers the store's `set`
   method with the payload.

  #### Example: Array of sources

  ```tsx
  export class MyService {
    nameChange$ = new Source<string>('nameChange$');
    nameChange2$ = new Source<string>('nameChange2$');

    name = adaptNgxs(['name', 'John'], [this.nameChange$, this.nameChange2$]);

    sub = this.name.state$.subscribe(console.log);

    constructor() {
      this.nameChange$.next('Johnsh'); // logs 'Johnsh'
      this.nameChange2$.next('Johnsh2'); // logs 'Johnsh2'
    }
  }
  ```

  3. A source can be an object with keys that match the names of the store's reactions, with a corresponding source or array of
  sources that trigger the store's reaction with the payload.

  #### Example: Object of sources

  ```tsx
  export class MyService {
    nameChange$ = new Source<string>('nameChange$');
    nameReset$ = new Source<void>('nameReset$');

    name = adaptNgxs(['name', 'John'], {
      set: this.nameChange$,
      reset: [this.nameReset$], // Can be array of sources too
    });

    sub = this.name.state$.subscribe(console.log);

    constructor() {
      this.nameChange$.next('Johnsh'); // logs 'Johnsh'
      this.nameReset$.next(); // logs 'John'
    }
  }
  ```

  4. A source can be a function that takes in a detached store (result of calling {@link watch}) and returns any of the above
  types of sources.

  #### Example: Function that returns sources

  ```tsx
  export class MyService {
    name = adaptNgxs(['name', 'John'], store => store.state$.pipe(
      delay(1000),
      map(name => `${name}sh`),
      toSource('recursive nameChange$'),
    ));

    sub = this.name.state$.subscribe(console.log);
    // logs 'Johnsh' after 1 second, then 'Johnshsh' after 2 seconds, etc.
  }
  ```

  Each selector's observable chains off of all the sources passed into the store. For example, if one of your sources
  is an observable of an HTTP request, that request will automatically be triggered as soon as you subscribe to any of
  the selector observables from the store. If necessary, you can access store selectors that do not chain off of any
  sources by using the {@link watchNgxs} function.

  ### Overload 4
  `adaptNgxs([path, initialState, adapter], sources)`

  The adapter and sources can be combined in the same overload.

  #### Example: Adapter and sources

  ```tsx
  export class MyService {
    nameChange$ = new Source<string>('nameChange$');
    nameConcat$ = new Source<string>('nameConcat$');

    nameAdapter = createAdapter<string>()({
      concat: (state, payload: string) => state + payload,
    });

    name = adaptNgxs(['name', 'John', this.nameAdapter], {
      set: this.nameChange$,
      concat: this.nameConcat$,
    });

    sub = name.state$.subscribe(console.log);

    constructor() {
      this.nameChange$.next('Johnsh'); // logs 'Johnsh'
      this.nameConcat$.next('sh'); // logs 'Johnshsh' // Example suggested by Copilot :)
    }
  }
  ```

  ### Remember!

  The store needs to have subscribers in order to start managing state.
*/
export const adaptNgxs: StateAdapt['adapt'] = <T extends any[]>(...args: T) => {
  const adaptDep = inject(AdaptNgxs); // Needs it from NGXS store
  return (adaptDep.adapt as any)(...args);
};
