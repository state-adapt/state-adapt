---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/adapt.context.ts#L21
---

# Variable: adapt()

> `const` **adapt**: \<`State`, `S`, `R`, `R2`, `ReturnedSources`\>(`initialState`, `second`) => `InitializedSmartStore`\<`State`, `S`, `object` *extends* `R` ? `R2` : `R`\> = `defaultStateAdapt.adapt`

Defined in: [react/src/lib/adapt.context.ts:21](https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/adapt.context.ts#L21)

Creates a store using React's default StateAdapt configuration.

This function is bound to [defaultStateAdapt](defaultStateAdapt.md). A custom
`AdaptContext.Provider` affects hooks, but it cannot change stores created at
module scope. For custom configuration, export `adapt` from the configured
instance instead.

`adapt` creates a store that will manage state while it has subscribers.

### Example: initialState only
`adapt(initialState)`

The simplest way to use `adapt` is to only pass it an initial state. `adapt` returns a store object that is ready to start managing state once it has subscribers.
The store object comes with `set` and `reset` methods for updating state, and a `state$` observable of the store's state.

```typescript
const name = adapt('John');

name.state$.subscribe(console.log); // logs 'John'

name.set('Johnsh'); // logs 'Johnsh'
name.reset(); // logs 'John'
```

Usually you won't manually subscribe to state like this, but you can if you want the store to immediately start managing state
and never clean it up.

### Example: Initial state factory
`adapt(() => initialState)`

You can pass a function that returns the initial state. The store calls it when it activates,
keeps that value for as long as it stays active, and discards it when it deactivates — so the factory runs again
for each activation.

This helps when initial state might be different at each time the store is being used, like with `localStorage`:

```typescript
const name = adapt(() => localStorage.getItem('name') ?? 'John');

// `localStorage` hasn't been read yet

const sub1 = name.state$.subscribe(console.log); // Reads `localStorage`, then logs 'John'
name.set('Johnsh'); // logs 'Johnsh'
name.reset(); // logs 'John'
sub1.unsubscribe(); // The store deactivates and forgets 'John'

localStorage.setItem('name', 'Jane');

const sub2 = name.state$.subscribe(console.log); // Reads `localStorage` again, logs 'Jane'
name.set('Janesh'); // logs 'Janesh'
name.reset(); // logs 'Jane', not 'John'
```

A one-off read of initial state will not use a cached value, but call the state factory function.

### Example: Using an adapter
`adapt(initialState, adapter)`

You can also pass in a state [Adapter](../../core/src/Adapter.md) object to customize the state change functions and selectors.

```typescript
const name = adapt('John', {
  concat: (state, payload: string) => state + payload,
  selectors: {
    length: state => state.length,
  },
});

name.state$.subscribe(console.log); // Logs 'John'
name.length$.subscribe(console.log); // Logs 4

name.concat('sh'); // logs 'Johnsh' and 6
name.reset(); // logs 'John' and 4
```

### Example: Using AdaptOptions
`adapt(initialState, { adapter, sources, path })`

You can also define an adapter, sources, and/or a state path as part of an AdaptOptions object.

Sources allow the store to declaratively react to external events rather than being commanded
by imperative code in callback functions.

```typescript
const tick$ = interval(1000);

const clock = adapt(0, {
  adapter: {
    increment: state => state + 1,
  },
  sources: tick$, // or [tick$], or { set: tick$ }, or { set: [tick$] }
  path: 'clock',
});

clock.state$.subscribe(console.log); // Logs 0, 1, 2, 3, etc.
```

When a store is subscribed to, it passes the subscriptions up the its sources.
For example, if a store has an HTTP source, it will be triggered when the store
receives its first subscriber, and it will be canceled when the store loses its
last subscriber.

There are 4 possible ways sources can be defined:

1\. A source can be a single source or [Observable](https://rxjs.dev/guide/observable)<`State`>. When the source emits, it triggers the store's `set` method
with the payload.

#### Example: Single source or observable

```typescript
const nameChange$ = source<string>();

const name = adapt('John', {
  sources: nameChange$,
  path: 'name',
});

name.state$.subscribe(console.log); // Logs 'John'

nameChange$.next('Johnsh'); // logs 'Johnsh'
```

2\. A source can be an array of sources or [Observable](https://rxjs.dev/guide/observable)<`State`>. When any of the sources emit, it triggers the store's `set`
 method with the payload.

#### Example: Array of sources or observables

```typescript
const nameChange$ = source<string>();
const nameChange2$ = source<string>();

const name = adapt('John', {
  sources: [nameChange$, nameChange2$],
  path: 'name',
});

name.state$.subscribe(console.log); // Logs 'John'

nameChange$.next('Johnsh'); // logs 'Johnsh'
nameChange2$.next('Johnsh2'); // logs 'Johnsh2'
```

3\. A source can be an object with keys that match the names of the [Adapter](../../core/src/Adapter.md) state change functions, with a corresponding source or array of
sources that trigger the store's reaction with the payload.

#### Example: Object of sources or observables

```typescript
const nameChange$ = source<string>();
const nameReset$ = source<void>();

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

4\. A source can be a function that takes in a detached store (doesn't chain off of sources) and returns any of the above
types of sources or observables.

#### Example: Function that returns an observable

```typescript
const name = adapt('John', {
  sources: store => store.state$.pipe(
    delay(1000),
    map(name => `${name}sh`),
  ),
  path: 'name',
});

name.state$.subscribe(console.log); // Logs 'John'
// logs 'Johnsh' after 1 second, then 'Johnshsh' after 2 seconds, etc.
```

Defining a path alongside sources is recommended to enable easier debugging with Redux DevTools. It's easy to trace state changes
caused by user events, but it's much harder to trace state changes caused by spontaneous RxJS streams.

The path string specifies the location in the global store you will find the state for the store
(while it is being used). StateAdapt splits this string at periods `'.'` to create an object path within
the global store. Here are some example paths and the resulting global state objects:

#### Example: Paths and global state

```ts
const count1 = adapt(0, { path: 'count.1' });
const count2 = adapt(0, { path: 'count.2' });

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
```

Each store completely owns its own state. If more than one store tries to use the same path, StateAdapt will throw this error:

`Path '${path}' collides with '${existingPath}', which has already been initialized as a state path.`

This applies both to paths that are identical as well as paths that are subtrings of each other. For example, if `'featureA'`
is already being used by a store and then another store tried to initialize at `'featureA.number'`, that error would be thrown.

To help avoid this error, StateAdapt provides a [getId](../../core/src/getId.md) function that can be used to generate unique paths:

#### Example: getId for unique paths

```typescript
import { getId } from '@state-adapt/core';

const store1 = adapt(0, { path: 'number' + getId() });
store1.state$.subscribe();
const store2 = adapt(0, { path: 'number' + getId() });
store2.state$.subscribe();
// global state includes both: { number0: 0, number1: 0 }
```

### No path

If no path is provided, then the store's path defaults to the result of calling [getId](../../core/src/getId.md).

### Remember!

The store needs to have subscribers in order to start managing state,
and it only subscribes to sources when it has subscribers itself.

## Type Parameters

### State

`State`

### S

`S` *extends* `Selectors`\<`State`\>

### R

`R` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

### R2

`R2` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

### ReturnedSources

`ReturnedSources` = `unknown`

## Parameters

### initialState

`InitialState`\<`State`\>

### second

`R` & `object` & `NotAdaptOptions` | `AdaptOptions`\<`State`, `S`, `R2`, `ReturnedSources`\>

## Returns

`InitializedSmartStore`\<`State`, `S`, `object` *extends* `R` ? `R2` : `R`\>
