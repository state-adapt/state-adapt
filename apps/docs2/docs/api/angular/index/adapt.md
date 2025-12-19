---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/adapt.function.ts#L291
---

# Function: adapt()

> **adapt**\<`State`, `S`, `R`, `R2`\>(`initialState`, `second`): \{ \[P in string \| number \| symbol as \`$\{P extends string ? P\<P\> : never\}$\`\]: Observable\<Exclude\<ReturnType\<((\{\} extends S ? S & \{\} : S) & WithGetState\<State\>)\[P\]\>, undefined\>\> \} & `object` & `object` & `SyntheticSources`\<`InitializedReactions`\<`State`, `S`, `object` *extends* `R` ? `R2` : `R`\>\> & \{(): `State`; `readOnce`: () => `State`; \} & \{ \[K in string \| number \| symbol\]: () =\> ReturnType\<S\[K\]\> \}

Defined in: [angular/src/lib/adapt.function.ts:291](https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/adapt.function.ts#L291)

`adapt` wraps [StateAdapt.adapt](../../rxjs/index/StateAdapt.md#adapt) and adds signals for the store's selectors.

### Example: initialState only

`adapt(initialState)`

The simplest way to use `adapt` is to only pass it an initial state. `adapt` creates a store that can be used just like an Angular signal.

In addition to the regular `set` method on signals, stores have a `reset` method, and a `state$` observable of the store's state.

```ts
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

You can also pass in a state [Adapter](../../core/src/Adapter.md) object to customize the state change functions and selectors.

```ts
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

### Example: Using AdaptOptions
`adapt(initialState, { adapter, sources, path, signalPing })`

You can also define an adapter, sources, a state path and a signal ping interval as part of an AdaptOptions object.

Sources allow the store to declaratively react to external events rather than be commanded
by imperative code in callback functions.

```ts
@Injectable({ providedIn: 'root' })
export class MyService {
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
    signalPing: 500, // Default 1000 ms
  });

  logSub = this.clock.state$.subscribe(console.log); // Logs 0, 1, 2, etc.
}
```

When a store is being used, it subscribes to its sources. When it goes back to unused, it resets its state and unsubscribes from its sources.

When created in a component (or service provided directly in a component), it is assumed that stores will be in use until that component is destroyed.

In shared services with `providedIn: 'root'`, the store is initialized when a signal is read or a selector observable is subscribed to.
The first time a store signal is read, it kicks off an interval (default `1000` ms, determined by `signalPing`) to ping the signal graph to see if anyone is listening.
When it detects nobody listening, and there are no subscriptions from store observables, the store is deactivated: Its state resets and
its sources are unsubscribed from. For example, if a store has an HTTP source, it will be triggered when the store
receives its first subscriber or signal read, and it will be canceled when the store loses its
last subscriber, or detects no effects listening to its signals.

Sources can be defined in 4 ways:

1\. A source can be a single [Source](../../rxjs/index/Source.md)`<State>` or [Observable](https://rxjs.dev/guide/observable)`<State>`. When the source emits, it triggers the store's `set` method
with the payload.

#### Example: Single source or observable

```ts
@Injectable({ providedIn: 'root' })
export class MyService {
  nameChange$ = source<string>();

  name = adapt('John', {
    sources: this.nameChange$,
    path: 'name',
  });

  constructor() {
    this.name.state$.subscribe(console.log); // Logs 'John'

    this.nameChange$.next('Bilbo'); // logs 'Bilbo'
  }
}
```

2\. A source can be an array of [Source](../../rxjs/index/Source.md)`<State>` or [Observable](https://rxjs.dev/guide/observable)`<State>`. When any of the sources emit, it triggers the store's `set`
 method with the payload.

#### Example: Array of sources or observables

```ts
@Injectable({ providedIn: 'root' })
export class MyService {
  nameChange$ = source<string>();
  nameChange2$ = source<string>();

  name = adapt('John', {
    sources: [this.nameChange$, this.nameChange2$],
    path: 'name',
  });

  constructor() {
    this.name.state$.subscribe(console.log); // Logs 'John'

    this.nameChange$.next('Bilbo'); // logs 'Bilbo'
    this.nameChange2$.next('Frodo'); // logs 'Frodo'
  }
}
```

3\. A source can be an object with keys that match the names of the [Adapter](../../core/src/Adapter.md) state change functions, with a corresponding [Source](../../rxjs/index/Source.md)`<State>` or array of
[Source](../../rxjs/index/Source.md)`<State>` that trigger the store's reaction with the payload.

#### Example: Object of sources or observables

```ts
@Injectable({ providedIn: 'root' })
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

    this.nameChange$.next('Bilbo'); // logs 'Bilbo'
    this.nameReset$.next(); // logs 'John'
  }
}
```

4\. A source can be a function that takes in a detached store (doesn't chain off of sources) and returns any of the above
types of sources or observables.

#### Example: Function that returns an observable

```ts
@Injectable({ providedIn: 'root' })
export class MyService {
  name = adapt('John ', {
    sources: store => store.state$.pipe(
      delay(1000),
      map(name => `${name}I`),
    ),
    path: 'name',
  });

  constructor() {
    this.name.state$.subscribe(console.log);
    // Logs 'John ', then 'John I' after 1 second, 'John II' after 2, etc.
  }
}
```

Defining a path alongside sources is recommended to enable easier debugging with Redux DevTools. It's easy to trace state changes
caused by user events, but it's much harder to trace state changes caused by spontaneous RxJS streams.

The path specifies the location in the global store you will find the state for the store
(while it is being used). StateAdapt splits this string at periods `'.'` to create an object path within
the global store. Here are some example paths and the resulting global state objects:

#### Example: Paths and global state

```ts
export class MyComponent {
  count1 = adapt(0, { path: 'count.1' });
  count2 = adapt(0, { path: 'count.2' });

  constructor() {
    this.count1.state$.subscribe();
    // global state:
    // {
    //   count: {
    //     1: 0,
    //   }
    // }

    this.count2.state$.subscribe();
    // global state:
    // {
    //   count: {
    //     1: 0,
    //     2: 0,
    //   }
    // }
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

Stores provided in `'root'` need to have subscribers or signal reads in order to activate and subscribe to their sources.

## Type Parameters

### State

`State`

### S

`S` *extends* `Selectors`\<`State`\>

### R

`R` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

### R2

`R2` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

## Parameters

### initialState

`State`

### second

`R` & `object` & `NotAdaptOptions` | `AdaptOptions`\<`State`, `S`, `R2`\>

## Returns
