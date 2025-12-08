---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/adapt.function.ts#L330
---

# Variable: adapt

> `const` **adapt**: [`StateAdapt`](../../rxjs/index/StateAdapt.md)\[`"adapt"`\]

Defined in: [lib/adapt.function.ts:330](https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/adapt.function.ts#L330)

`adapt` wraps [StateAdapt.adapt](../../rxjs/index/StateAdapt.md#adapt) for Angular.

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

You can also pass in a state [Adapter](../../core/src/Adapter.md) object to customize the state change functions and selectors.

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

### Example: Using AdaptOptions
`adapt(initialState, { adapter, sources, path })`

You can also define an adapter, sources, and/or a state path as part of an AdaptOptions object.

Sources allow the store to declaratively react to external events rather than being commanded
by imperative code in callback functions.

```typescript
export class MyService {
  tick$ = interval(1000);

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

When a store is subscribed to, it passes the subscriptions up to its sources.
For example, if a store has an HTTP source, it will be triggered when the store
receives its first subscriber, and it will be canceled when the store loses its
last subscriber.

There are 4 possible ways sources can be defined:

1\. A source can be a single source or [Observable](https://rxjs.dev/guide/observable)`<``State``>`. When the source emits, it triggers the store's `set` method
with the payload.

#### Example: Single source or observable

```typescript
export class MyService {
  nameChange$ = source<string>();

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

2\. A source can be an array of sources or [Observable](https://rxjs.dev/guide/observable)`<``State``>`. When any of the sources emit, it triggers the store's `set`
 method with the payload.

#### Example: Array of sources or observables

```typescript
export class MyService {
  nameChange$ = source<string>();
  nameChange2$ = source<string>();

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

3\. A source can be an object with keys that match the names of the [Adapter](../../core/src/Adapter.md) state change functions, with a corresponding source or array of
sources that trigger the store's reaction with the payload.

#### Example: Object of sources or observables

```typescript
export class MyService {
  nameChange$ = source<string>();
  nameReset$ = source<void>();

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

4\. A source can be a function that takes in a detached store (doesn't chain off of sources) and returns any of the above
types of sources or observables.

#### Example: Function that returns an observable

```typescript
export class MyService {
  name = adapt('John', {
    sources: store => store.state$.pipe(
      delay(1000),
      map(name => `${name}sh`),
    ),
    path: 'name',
  });

  constructor() {
    this.name.state$.subscribe(console.log);
    // Logs 'John', then 'Johnsh' after 1 second, 'Johnshsh' after 2 seconds, etc.
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

This applies both to paths that are identical as well as paths that are substrings of each other. For example, if `'featureA'`
is already being used by a store and then another store tried to initialize at `'featureA.number'`, that error would be thrown.

To help avoid this error, StateAdapt provides a [getId](../../core/src/getId.md) function that can be used to generate unique paths:

#### Example: getId for unique paths

```typescript
import { getId } from '@state-adapt/core';

export class MyComponent {
  store1 = adapt(0, { path: 'number' + getId() });
  store2 = adapt(0, { path: 'number' + getId() });

  constructor() {
    this.store1.state$.subscribe();
    this.store2.state$.subscribe();
    // global state includes both: { number0: 0, number1: 0 }
  }
}
```

### No path

If no path is provided, then the store's path defaults to the result of calling [getId](../../core/src/getId.md).

### Remember!

The store needs to have subscribers in order to start managing state,
and it only subscribes to sources when it has subscribers itself.
