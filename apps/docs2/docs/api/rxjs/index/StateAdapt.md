---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/global-store/state-adapt.ts#L74
---

# Class: StateAdapt\<CommonStore\>

Defined in: [libs/rxjs/src/lib/global-store/state-adapt.ts:74](https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/global-store/state-adapt.ts#L74)

## Type Parameters

### CommonStore

`CommonStore` *extends* `GlobalStoreMethods` = `any`

## Methods

### adapt()

> **adapt**\<`State`, `S`, `R`, `R2`\>(`initialState`, `second`): `InitializedSmartStore`\<`State`, `S`, `object` *extends* `R` ? `R2` : `R`\>

Defined in: [libs/rxjs/src/lib/global-store/state-adapt.ts:286](https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/global-store/state-adapt.ts#L286)

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

Defining a path alongside sources is recommended to enable debugging with Redux DevTools. It's easy to trace
singular state changes caused by user events, but it's much harder to trace state changes caused by RxJS streams.

The path string specifies the location in the global store you will find the state for the store being created
(while the store has subscribers). StateAdapt splits this string at periods `'.'` to create an object path within
the global store. Here are some example paths and the resulting global state objects:

#### Example: Paths and global state

```typescript
const store = adapt(0, { path: 'number' });
store.state$.subscribe();
// global state: { number: 0 }
```

```typescript
const store = adapt(0, { path: 'featureA.number' });
store.state$.subscribe();
// global state: { featureA: { number: 0 } }
```

```typescript
const store = adapt(0, { path: 'featureA.featureB.number' });
store.state$.subscribe();
// global state: { featureA: { featureB: { number: 0 } } }
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

#### Type Parameters

##### State

`State`

##### S

`S` *extends* `Selectors`\<`State`\>

##### R

`R` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

##### R2

`R2` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

#### Parameters

##### initialState

`State`

##### second

`R` & `object` & `NotAdaptOptions` | `AdaptOptions`\<`State`, `S`, `R2`\>

#### Returns

`InitializedSmartStore`\<`State`, `S`, `object` *extends* `R` ? `R2` : `R`\>

***

### watch()

> **watch**\<`State`, `S`, `R`\>(`path`, `adapter`): `SmartStore`\<`State`, `S` & `WithGetState`\<`State`\>\>

Defined in: [libs/rxjs/src/lib/global-store/state-adapt.ts:409](https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/global-store/state-adapt.ts#L409)

`watch` returns a detached store (doesn't chain off of sources). This allows you to watch state without affecting anything.
It takes 2 arguments: The path of the state you are interested in, and the adapter you want to use.

```tsx
watch(path, adapter)
```

path — Object path in Redux Devtools

adapter — Object with state change functions and selectors

### Usage

`watch` enables accessing state without subscribing to sources. For example, if your adapter manages the loading state
for an HTTP request and you need to know if the request is loading before the user is interested in the data,
`watch` can give you access to it without triggering the request.

#### Example: Accessing loading state

```tsx
watch('data', httpAdapter).loading$.subscribe(console.log);
```

#### Type Parameters

##### State

`State`

##### S

`S` *extends* `Selectors`\<`State`\>

##### R

`R` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

#### Parameters

##### path

`string`

##### adapter

[`Adapter`](../../core/src/Adapter.md)\<`State`, `S`, `R` & `BasicAdapterMethods`\<`State`\>\>

#### Returns

`SmartStore`\<`State`, `S` & `WithGetState`\<`State`\>\>
