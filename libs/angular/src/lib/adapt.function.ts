import { inject } from '@angular/core';
import { StateAdapt } from '@state-adapt/rxjs';
// Import all the {@links to other functions and services
import { watch } from './watch.function';
import { Action, Adapter, getId, createAdapter } from '@state-adapt/core';
import { Source } from '@state-adapt/rxjs';

/*
Ask ChatGPT:

I'm using TypeScript. I have documentation for a class method `StateAdapt.adapt` that needs to be modified for a wrapper function called `adapt`. Here are the differences:
  - The phrase "`adapt` wraps {@link StateAdapt.adapt}, calling `inject(StateAdapt)` to get the instance of {@link StateAdapt} to use." is added right after the copilot tip
  - Examples are modified to show usage in Angular classes called MyComponent for simple examples, or MyService for complex examples.
    Include the entire class definition starting with`export class MyComponent { or export class MyService {
    Write the logging code in the class constructor.
  - Replace {@link StateAdapt.watch} with {@link watch}
  - Replace StateAdapt.adapt with adapt in the first sentence

Don't skip anything. Give me the entire documentation from start to end.

Here's an example before:

```typescript
  const nameChange$ = new Source<string>('nameChange$');
  const nameReset$ = new Source<void>('nameReset$');

  const name = adapt('John', {
    sources: {
      set: nameChange$,
      reset: nameReset$,
    },
    path: 'name',
  });

  name.state$.subscribe(console.log); // Logs 'John'

  nameChange$.next('Johnsh'); // logs 'Johnsh'
  nameReset$.next(); // logs 'John'
```

after:

```typescript
  export class MyService {
    nameChange$ = new Source<string>('nameChange$');
    nameReset$ = new Source<void>('nameReset$');

    name = adapt('John', {
      sources: {
        set: this.nameChange$,
        reset: this.nameReset$,
      },
      path: 'name',
    });

    constructor() {
      this.name.state$.subscribe(console.log); // Logs 'John'

      this.nameChange$.next('Johnsh'); // logs 'Johnsh'
      this.nameReset$.next(); // logs 'John'
    }
  }
```

Don't skip anything. Give me the entire documentation from start to end.

Here are the docs:



Don't skip anything. Give me the entire documentation from start to end.
*/
/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `adapt`

  > Copilot tip: Copy examples into your file or click to definition to open file with context for better Copilot suggestions.

  `adapt` wraps {@link adapt}, calling `inject(StateAdapt)` to get the instance of {@link StateAdapt} to use.

  `adapt` creates a store that will manage state while it has subscribers.

  ### Example: initialState only
  `adapt(initialState)`

  The simplest way to use `adapt` is to only pass it an initial state. `adapt` returns a store object that is ready to start managing state once it has subscribers.
  The store object comes with `set` and `reset` methods for updating state, and a `state$` observable of the store's state.

  ```typescript
  export class MyComponent {
    name = adapt('John');

    constructor() {
      this.name.state$.subscribe(console.log); // logs 'John'
      this.name.set('Johnsh'); // logs 'Johnsh'
      this.name.reset(); // logs 'John'
    }
  }
  ```

  Usually you won't manually subscribe to state like this, but you can if you want the store to immediately start managing state
  and never clean it up.

  ### Example: Using an adapter
  `adapt(initialState, adapter)`

  You can also pass in a state {@link Adapter} object to customize the state change functions and selectors.

  ```typescript
  export class MyComponent {
    name = adapt('John', {
      concat: (state, payload: string) => state + payload,
      selectors: {
        length: state => state.length,
      },
    });

    constructor() {
      this.name.state$.subscribe(console.log); // Logs 'John'
      this.name.length$.subscribe(console.log); // Logs 4
      this.name.concat('sh'); // logs 'Johnsh' and 6
      this.name.reset(); // logs 'John' and 4
    }
  }
  ```

  ### Example: Using {@link AdaptOptions}
  `adapt(initialState, { adapter, sources, path })`

  You can also define an adapter, sources, and/or a state path as part of an {@link AdaptOptions} object.

  Sources allow the store to declaratively react to external events rather than being commanded
  by imperative callback functions.

  ```typescript
  export class MyService {
    tick$ = interval(1000).pipe(toSource('tick$'));

    clock = adapt(0, {
      adapter: {
        increment: state => state + 1,
      },
      sources: this.tick$, // or [this.tick$], or { set: this.tick$ }, or { set: [this.tick$] }
      path: 'clock',
    });

    constructor() {
      this.clock.state$.subscribe(console.log); // Logs 0, 1, 2, 3, etc.
    }
  }
  ```

  When a store is subscribed to, it passes the subscriptions up the its sources.
  For example, if a store has an HTTP source, it will be triggered when the store
  receives its first subscriber, and it will be canceled when the store loses its
  last subscriber.

  There are 4 possible ways sources can be defined:

  1\. A source can be a single {@link Source} or [Observable](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>>. When the source emits, it triggers the store's `set` method
  with the payload.

  #### Example: Single source

  ```typescript
  export class MyService {
    nameChange$ = new Source<string>('nameChange$');

    name = adapt('John', {
      sources: this.nameChange$,
      path: 'name',
    });

    constructor() {
      this.name.state$.subscribe(console.log); // Logs 'John'
      this.nameChange$.next('Johnsh'); // logs 'Johnsh'
    }
  }
  ```

  2\. A source can be an array of {@link Source} or [Observable](https://rxjs.dev/guide/observable)<{@link Action}<{@link State}>>. When any of the sources emit, it triggers the store's `set`
    method with the payload.

  #### Example: Array of sources

  ```typescript
  export class MyService {
    nameChange$ = new Source<string>('nameChange$');
    nameChange2$ = new Source<string>('nameChange2$');

    name = adapt('John', {
      sources: [this.nameChange$, this.nameChange2$],
      path: 'name',
    });

    constructor() {
      this.name.state$.subscribe(console.log); // Logs 'John'
      this.nameChange$.next('Johnsh'); // logs 'Johnsh'
      this.nameChange2$.next('Johnsh2'); // logs 'Johnsh2'
    }
  }
  ```

  3\. A source can be an object with keys that match the names of the {@link Adapter} state change functions, with a corresponding source or array of
  sources that trigger the store's reaction with the payload.

  #### Example: Object of sources

  ```typescript
  export class MyService {
    nameChange$ = new Source<string>('nameChange$');
    nameReset$ = new Source<void>('nameReset$');

    name = adapt('John', {
      sources: {
        set: this.nameChange$,
        reset: this.nameReset$,
      },
      path: 'name',
    });

    constructor() {
      this.name.state$.subscribe(console.log); // Logs 'John'
      this.nameChange$.next('Johnsh'); // logs 'Johnsh'
      this.nameReset$.next(); // logs 'John'
    }
  }
  ```

  4\. A source can be a function that takes in a detached store (result of calling {@link watch}) and returns any of the above
  types of sources.

  #### Example: Function that returns a source

  ```typescript
  export class MyService {
    name = adapt('John', {
      sources: store => store.state$.pipe(
        delay(1000),
        map(name => `${name}sh`),
        toSource('recursive nameChange$'),
      ),
      path: 'name',
    });

    constructor() {
      this.name.state$.subscribe(console.log); // Logs 'John'
      // logs 'Johnsh' after 1 second, then 'Johnshsh' after 2 seconds, etc.
    }
  }
  ```

  Defining a path alongside sources is recommended to enable debugging with Redux DevTools. It's easy to trace
  singular state changes caused by user events, but it's much harder to trace state changes caused by RxJS streams.

  The path string specifies the location in the global store you will find the state for the store being created
  (while the store has subscribers). StateAdapt splits this string at periods `'.'` to create an object path within
  the global store. Here are some example paths and the resulting global state objects:

  #### Example: Paths and global state

  ```typescript
  export class MyComponent {
    store = adapt(0, { path: 'number' });

    constructor() {
      this.store.state$.subscribe();
      // global state: { number: 0 }
    }
  }
  ```

  ```typescript
  export class MyComponent {
    store = adapt(0, { path: 'featureA.number' });

    constructor() {
      this.store.state$.subscribe();
      // global state: { featureA: { number: 0 } }
    }
  }
  ```

  ```typescript
  export class MyComponent {
    store = adapt(0, { path: 'featureA.featureB.number' });

    constructor() {
      this.store.state$.subscribe();
      // global state: { featureA: { featureB: { number: 0 } } }
    }
  }
  ```

  Each store completely owns its own state. If more than one store tries to use the same path, StateAdapt will throw this error:

  `Path '${path}' collides with '${existingPath}', which has already been initialized as a state path.`

  This applies both to paths that are identical as well as paths that are subtrings of each other. For example, if `'featureA'`
  is already being used by a store and then another store tried to initialize at `'featureA.number'`, that error would be thrown.

  To help avoid this error, StateAdapt provides a {@link getId} function that can be used to generate unique paths:

  #### Example: getId for unique paths

  ```typescript
  import { getId } from '@state-adapt/core';

  export class MyService {
    store1 = adapt(0, { path: 'number' + getId() });
    store2 = adapt(0, { path: 'number' + getId() });

    constructor() {
      this.store1.state$.subscribe();
      this.store2.state$.subscribe();
      // global state includes both: { number0: 0, number1: 0 }
    }
  }
  ```

  ### Remember!

  The store needs to have subscribers in order to start managing state,
  and it only subscribes to sources when it has subscribers itself.
  */
export const adapt: StateAdapt['adapt'] = <T extends any[]>(...args: T) => {
  const adaptDep = inject(StateAdapt);
  return (adaptDep.adapt as any)(...args);
};
