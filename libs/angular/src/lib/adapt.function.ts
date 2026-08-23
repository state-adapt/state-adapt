import { computed, inject } from '@angular/core';
import {
  AdaptOptions,
  InitialState,
  InitializedSmartStore,
  NotAdaptOptions,
  StateAdapt,
} from '@state-adapt/rxjs';
import { Adapter, getId, Selectors, ReactionsWithSelectors } from '@state-adapt/core';
import { Source } from '@state-adapt/rxjs';
import { StateAdaptToken } from './state-adapt-token.const';
import { StoreSignals } from './store-signals.type';
import { toSignal } from './to-signal.function';

/**
  `adapt` wraps {@link StateAdapt.adapt} and adds signals for the store's selectors.

  ### Example: initialState only

  `adapt(initialState)`

  The simplest way to use `adapt` is to only pass it an initial state. `adapt` creates a store that can be used just like an Angular signal.

  In addition to the regular `set` method on signals, stores have a `reset` method, and a `state$` observable of the store's state.

  ```typescript
  import { Component } from '@angular/core';
  import { adapt } from '@state-adapt/angular';

  @Component({
    template: `
      <div>Count is {{ count() }}</div>
      <div>Count is {{ count.state$ | async }}</div> <!-- Same -->
      <button (click)="count.set(5)">Set to 5</button>
      <button (click)="count.reset()">Reset Count</button>
    `,
  })
  export class MyComponent {
    count = adapt(0);
  }
  ```

  ### Example: Using an adapter
  `adapt(initialState, adapter)`

  You can also pass in a state {@link Adapter} object to customize the state change functions and selectors.

  ```typescript
  import { Component } from '@angular/core';
  import { adapt } from '@state-adapt/angular';

  @Component({
    template: `
      <div>Count is {{ count() }}</div>
      <div>Double count is {{ count.double() }}</div>
      <div>Double count is {{ count.double$ | async }}</div> <!-- Same -->
      <button (click)="count.increment()">Increment</button>
    `,
  })
  export class MyComponent {
    count = adapt(0, {
      increment: state => state + 1,
      selectors: {
        double: state => state * 2,
      },
    });
  }
  ```

  ### Example: Using {@link AdaptOptions}
  `adapt(initialState, { adapter, sources, path })`

  You can also define an adapter, sources, and a state path as part of an {@link AdaptOptions} object.

  Sources allow the store to declaratively react to external events rather than be commanded
  by imperative code in callback functions.

  ```typescript
  import { Component, inject, Injectable } from '@angular/core';
  import { adapt } from '@state-adapt/angular';
  import { interval } from 'rxjs';

  @Injectable({ providedIn: 'root' })
  export class ClockService {
    tick$ = interval(1000);

    clock = adapt(0, {
      adapter: {
        increment: state => state + 1,
      },
      sources: this.tick$,
      // Alternatives:
      // sources: [this.tick$],
      // sources: { set: this.tick$ },
      // sources: { set: [this.tick$] },
      path: 'clock',
    });
  }

  @Component({
    template: `<div>Ticks: {{ clock() }}</div>`, // 0, then 1, 2, etc.
  })
  export class ClockComponent {
    clock = inject(ClockService).clock;
  }
  ```

  When a store is being used, it subscribes to its sources. When it goes back to unused, it resets its state and unsubscribes from its sources.

  When created in a component (or service provided directly in a component), it is assumed that stores will be in use until that component is destroyed.

  In shared services with `providedIn: 'root'`, a one-off signal read does not activate the store.
  After rendering stabilizes, StateAdapt checks which store signals are still consumed by a template or effect and subscribes only to those stores.
  When a later render shows that a store signal is no longer consumed, and if there are no subscriptions to its observables, the store is deactivated:
  Its state resets and its sources are unsubscribed from.

  Sources can be defined in 4 ways:

  1\. A source can be a single {@link Source}`<State>` or [Observable](https://rxjs.dev/guide/observable)`<State>`. When the source emits, it triggers the store's `set` method
  with the payload.

  #### Example: Single source or observable

  ```typescript
  import { Component, inject, Injectable } from '@angular/core';
  import { adapt } from '@state-adapt/angular';
  import { source } from '@state-adapt/rxjs';

  @Injectable({ providedIn: 'root' })
  export class NameService {
    nameChange$ = source<string>('nameChange$');

    name = adapt('John', {
      sources: this.nameChange$,
      path: 'name',
    });
  }

  @Component({
    template: `
      <div>{{ names.name() }}</div> <!-- 'John', then 'Bilbo' after the click -->
      <button (click)="names.nameChange$('Bilbo')">Rename</button>
    `,
  })
  export class NameComponent {
    names = inject(NameService);
  }
  ```

  2\. A source can be an array of {@link Source}`<State>` or [Observable](https://rxjs.dev/guide/observable)`<State>`. When any of the sources emit, it triggers the store's `set`
   method with the payload.

  #### Example: Array of sources or observables

  ```typescript
  import { Component, inject, Injectable } from '@angular/core';
  import { adapt } from '@state-adapt/angular';
  import { source } from '@state-adapt/rxjs';

  @Injectable({ providedIn: 'root' })
  export class NameService {
    nameChange$ = source<string>('nameChange$');
    nameChange2$ = source<string>('nameChange2$');

    name = adapt('John', {
      sources: [this.nameChange$, this.nameChange2$],
      path: 'name',
    });
  }

  @Component({
    template: `
      <div>{{ names.name() }}</div> <!-- 'John', then whichever source emitted last -->
      <button (click)="names.nameChange$('Bilbo')">Rename</button>
      <button (click)="names.nameChange2$('Frodo')">Rename from the 2nd source</button>
    `,
  })
  export class NameComponent {
    names = inject(NameService);
  }
  ```

  3\. A source can be an object with keys that match the names of the {@link Adapter} state change functions, with a corresponding {@link Source}`<State>` or array of
  {@link Source}`<State>` that trigger the store's reaction with the payload.

  #### Example: Object of sources or observables

  ```angular-ts
  import { Component, inject, Injectable } from '@angular/core';
  import { adapt } from '@state-adapt/angular';
  import { source } from '@state-adapt/rxjs';

  @Injectable({ providedIn: 'root' })
  export class NameService {
    nameChange$ = source<string>('nameChange$');
    nameReset$ = source<void>('nameReset$');

    name = adapt('John', {
      sources: {
        set: this.nameChange$,
        reset: this.nameReset$,
      },
      path: 'name',
    });
  }

  @Component({
    template: `
      <div>{{ names.name() }}</div> <!-- 'John', 'Bilbo' after renaming, 'John' again after resetting -->
      <button (click)="names.nameChange$('Bilbo')">Rename</button>
      <button (click)="names.nameReset$()">Reset</button>
    `,
  })
  export class NameComponent {
    names = inject(NameService);
  }
  ```

  4\. A source can be a function that takes in a detached store (doesn't chain off of sources) and returns any of the above
  types of sources or observables.

  #### Example: Function that returns an observable

  ```angular-ts
  import { Component, inject, Injectable } from '@angular/core';
  import { adapt } from '@state-adapt/angular';
  import { delay, map } from 'rxjs/operators';

  @Injectable({ providedIn: 'root' })
  export class NameService {
    name = adapt('John ', {
      sources: store => store.state$.pipe(
        delay(1000),
        map(name => `${name}I`),
      ),
      path: 'name',
    });
  }

  @Component({
    template: `
      <div>{{ names.name() }}</div>
      <!-- 'John ', then 'John I' after 1 second, 'John II' after 2, etc. -->

      <div>{{ names.name.state$ | async }}</div> <!-- Same -->
    `,
  })
  export class NameComponent {
    names = inject(NameService);
  }
  ```

  Whether the store is read as a signal or through `state$`, it is in use, so the source keeps running.

  Defining a path alongside sources is recommended to enable easier debugging with Redux DevTools. It's easy to trace state changes
  caused by user events, but it's much harder to trace state changes caused by spontaneous RxJS streams.

  The path specifies the location in the global store you will find the state for the store
  (while it is being used). StateAdapt splits this string at periods `'.'` to create an object path within
  the global store. Here are some example paths and the resulting global state objects:

  #### Example: Paths and global state

  ```angular-ts
  import { Component } from '@angular/core';
  import { adapt } from '@state-adapt/angular';

  @Component({
    template: `
      <div>Count 1 is {{ count1() }}</div>
      <div>Count 2 is {{ count2() }}</div>
    `,
  })
  export class MyComponent {
    count1 = adapt(0, { path: 'count.1' });
    count2 = adapt(0, { path: 'count.2' });
    // While this component is alive, global state:
    // {
    //   count: {
    //     1: 0,
    //     2: 0,
    //   }
    // }
  }
  ```

  Each store completely owns its own state. If more than one store tries to use the same path, StateAdapt will throw this error:

  `Path '${path}' collides with '${existingPath}', which has already been initialized as a state path.`

  This applies both to paths that are identical as well as paths that are substrings of each other. For example, if `'featureA'`
  is already being used by a store and then another store tried to initialize at `'featureA.number'`, that error would be thrown.

  To help avoid this error, StateAdapt provides a {@link getId} function that can be used to generate unique paths:

  #### Example: getId for unique paths

  ```typescript
  import { Component } from '@angular/core';
  import { getId } from '@state-adapt/core';
  import { adapt } from '@state-adapt/angular';

  @Component({
    template: `
      <div>{{ store1() }}</div>
      <div>{{ store2() }}</div>
    `,
  })
  export class MyComponent {
    store1 = adapt(0, { path: 'number' + getId() });
    store2 = adapt(0, { path: 'number' + getId() });
    // global state includes both: { number0: 0, number1: 0 }
  }
  ```

  ### No path

  If no path is provided, then the store's path defaults to the result of calling {@link getId}.

  ### Example: Initial state factory
  `adapt(() => initialState)`

  You can pass a function that returns the initial state. The store calls it when it activates,
  keeps that value for as long as it stays active, and discards it when it deactivates—so the factory runs again
  for each activation.

  This helps when initial state might be different at each time the store is activated, like with `localStorage`:

  ```typescript
  import { Component } from '@angular/core';
  import { adapt } from '@state-adapt/angular';

  @Component({
    template: `
      <div>Name is {{ name() }}</div>
      <button (click)="name.reset()">Reset Name</button>
    `,
  })
  export class MyComponent {
    // Each component reads `localStorage` when it activates the store,
    // and `reset` goes back to what it read
    name = adapt(() => localStorage.getItem('name') ?? 'John');
  }
  ```

  A one-off store read will call the state factory function.

  ### Remember!

  Stores provided in `'root'` activate and subscribe to their sources only once something uses them — a template or effect
  reading one of their signals, or a subscription to one of their observables.
  */
export const adapt = <
  State,
  S extends Selectors<State>,
  R extends ReactionsWithSelectors<State, S>,
  R2 extends ReactionsWithSelectors<State, S>,
  ReturnedSources = unknown,
>(
  initialState: InitialState<State>,
  second:
    | (R & { selectors?: S } & NotAdaptOptions)
    | AdaptOptions<State, S, R2, ReturnedSources> = {},
  // eslint-disable-next-line @typescript-eslint/ban-types -- Literal `{}` preserves deferred generic inference.
): InitializedSmartStore<State, S, {} extends R ? R2 : R> & StoreSignals<State, S> => {
  const adaptDep = inject(StateAdaptToken);
  const storeObj = adaptDep.adapt(initialState, second);
  // Lazy so an initial state factory isn't called until the signal is read before its first emission
  const state = toSignal(storeObj.state$, {
    initialValue: () => storeObj.__.initialState,
  });

  const store: any = function () {
    return state();
  };
  Object.assign(store, storeObj);

  const selectors = storeObj.__.selectors;
  for (const prop in selectors) {
    const value = computed(() => selectors[prop](state()));
    if (fnOverrideProps.includes(prop)) {
      Object.defineProperty(store, prop, { value });
    } else {
      store[prop] = value;
    }
  }

  return store;
};

// toString doesn't care; regular assignment works fine
const fnOverrideProps = ['length', 'name'];
