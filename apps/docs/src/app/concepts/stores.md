# Stores

- [Overview](/concepts/stores#overview)
- [`init`](/concepts/stores#init)
- [State Paths](/concepts/stores#state-paths)
- [`getState`](/concepts/stores#getstate)
- [`initGet`](/concepts/stores#initget)
- [Selectors](/concepts/stores#selectors)
- [`updater`](/concepts/stores#updater)
- [`setter`](/concepts/stores#setter)
- [`select`](/concepts/stores#select)
- [Joining Stores](/concepts/stores#joining-stores)

## Overview

Stores do 3 things:

- Define initial state and an adapter to manage it
- Connect sources to adapter state changes
- Use the adapter's selectors to create observables of the selectors' results. These observables chain off the sources so subscriptions are propagated

Stores _do not_ subscribe to sources on their own. Nothing will happen until you subscribe to one of the selector observables.

## `init`

`init` is the method on `AdaptCommon` that creates a store for an adapter. It takes 2 arguments and returns a store object:

```typescript
import { AdaptCommon } from '@state-adapt/core';
// ...
numberStore = this.adapt.init(
  ['number', numberAdapter, 0],
  { add: this.numberAdded$ },
);

constructor(private adapt: AdaptCommon<any>) {}
```

The first argument is an array of 3 elements:

- `path`: Object [path](/concepts/stores#state-paths) (a `string`) in the global store where this state will live
- `adapter`: The adapter that will manage the state in this store
- `initialState`: The initial state for this store

The 2nd argument is an object that maps the relationship between state changes and the sources that should trigger them. This object is equivalent to a reducer in _Redux_ or _NgRx_. The property names of the object are the adapter's state change function names. The right-hand side of the object specifies one or more sources that should trigger the state change specified in the property name. To specify multiple sources, pass them in an array, like

```typescript
{
  add: [this.numberAdded$, this.aDifferentNumberAdded$],
}
```

## State Paths

The [path](/concepts/stores#state-paths) string passed into [`init`](/concepts/stores#init) specifies the location in the global store you will find the state for the store being created. StateAdapt splits this string at periods `'.'` and uses the resulting array to define an object path for the state. For example, with an initial state of `0`, the following paths will create the following objects for the global store:

```typescript
'number' ==> { number: 0 }

'featureA.number' ==> { featureA: { number: 0 } }

'featureA.featureB.number' ==> { featureA: { featureB: { number: 0 } } }
```

Each store completely owns its own state. If more than one store tries to use the same path, StateAdapt will throw this error:

`Path '${path}' collides with '${existingPath}', which has already been initialized as a state path.`

This applies both to paths that are identical as well as paths that are subtrings of another path. For example, if `'featureA'` is already being used by a state and then another store tried to initialize at `'featureA.number'`, that error would be thrown.

## `getState`

[`getState`](/concepts/stores#getstate) is a method created for each store. It returns an observable of the store's state:

```typescript
numberStore = this.adapt.init(['number', numberAdapter, 0], {});
number$ = this.numberStore.getState();
```

## `initGet`

[`initGet`](/concepts/stores#initget) is syntactic sugar for calling [`init`](/concepts/stores#init) and then calling the [`getState`](/concepts/stores#getstate) method of the returned store. For example,

```typescript
numberStore = this.adapt.init(['number', numberAdapter, 0], {});
number$ = this.numberStore.getState();
```

is the same as

```typescript
number$ = this.adapt.initGet(['number', numberAdapter, 0], {});
```

## Selectors

If selectors are defined in an adapter they get assigned to methods on the store object. They return observables of the selected state:

```typescript
numberAdapter = createAdapter<number>()({
  selectors: {
    getNegative: state => state * -1,
  },
});
numberStore = this.adapt.init(['number', this.numberAdapter, 0], {});
negativeNumber$ = this.numberStore.getNegative();
```

Each selector's observable chains off of all the sources passed into the store. For example, if one of your sources is an observable of an HTTP request, that request will automatically be triggered as soon as you subscribe to any of the selector observables from the store. We recommend keeping your adapters and stores relatively small and focused on one concern so that accessing one part of state does not cause unrelated/unneeded data to be fetched.

If necessary, you can also access store selectors that do not chain off of any sources by using the [`select`](/concepts/stores#select) method described below.

## `updater`

[`updater`](/concepts/stores#updater) is a method on `AdaptCommon` that is syntactic sugar for creating a store with the [basic adapter](/concepts/adapters#basic-adapter) in `@state-adapt/core`. It expects only one type of source, which can be a single source or an array of sources that trigger the basic adapter's [`update`](/concepts/adapters#basic-adapter) method. The [`update`](/concepts/adapters#basic-adapter) method requires the state to be an object so it can spread it in the updates. This usage of [`updater`](/concepts/stores#updater)

```typescript
valueChanges$ = this.form.valueChanges.pipe(toSource('[Form] Value Change'));
formValues$ = this.adapt.updater('form', { name: '' }, this.valueChanges$);
```

is equivalent to

```typescript
import { createBasicAdapter } from '@state-adapt/core';
// ...
valueChanges$ = this.form.valueChanges.pipe(toSource('[Form] Value Change'));
formAdapter = createBasicAdapter<{ name: string }>();
formValues$ = this.adapt.initGet(['form', this.formAdapter, { name: '' }], {
  update: this.valueChanges$,
});
```

[`updater`](/concepts/stores#updater) is like kind of like RxJS's `BehaviorSubject`, except you get to see its state in Redux Devtools. It is best to only use it for extremely trivial state. If you find yourself calculating future states in your source observables and only using [`updater`](/concepts/stores#updater) to store the results, your sources are concerned with too much and you should be using an adapter and [`init`](/concepts/stores#init) instead.

## `setter`

[`setter`](/concepts/stores#setter) is the same as [`updater`](/concepts/stores#updater), except instead of triggering the [`update`](/concepts/adapters#basic-adapter) state change it triggers the [`set`](/concepts/adapters#basic-adapter) state change. You can only use it for state that cannot be spread (non-objects), like `number` or `string`.

## `select`

[`select`](/concepts/stores#select) is a method on `AdaptCommon` that returns a store that does not chain off of sources. It takes 2 arguments: The [path](/concepts/stores#state-paths) of the state you are interested in, and the adapter containing the selectors you want to use:

```typescript
negativeNumber$ = this.adapt.select('number', numberAdapter).getNegative();
```

[`select`](/concepts/stores#select) is useful in 2 situations primarily: [Selecting without subscribing](/concepts/stores#selecting-without-subscribing) and [selecting for a source](/concepts/stores#selecting-for-a-source).

### 1. Selecting without Subscribing

[`select`](/concepts/stores#select) enables accessing state without subscribing to sources. For example, if your adapter manages the `loading` state for an HTTP request and you need to know if the request is loading _before_ the user is interested in the data, [`select`](/concepts/stores#select) can give you access to it without triggering the request. This is probably not common, but [`select`](/concepts/stores#select) makes it possible.

### 2. Selecting for a Source

It would be impossible for a source itself to access state from the store without [`select`](/concepts/stores#select) because it would require using the store before it had been defined. The following example demonstrates this:

```typescript
dataReceived$ = this.dataStore.getDataNeeded().pipe(
  // Error: Property 'dataStore' is used before its initialization.
  filter(needed => needed),
  switchMap(() => this.dataService.fetchData()),
  toSource('dataReceived$'),
);

dataStore = this.adapt.init(['data', dataAdapter, initialState], {
  receive: this.dataReceived$,
});
```

In this example `getDataNeeded` is a selector that returns `true` if data needs to be fetched. This could be useful if the user is given a refresh button which triggers a state change back to the initial state. Since the `dataReceived$` source chains off of `dataNeeded$`, this reset would automatically trigger the request to be made again. Very reactive!

However, `dataReceived$` needs to reference `this.dataStore.getDataNeeded`, which is impossible because `dataStore` uses `dataReceived$`. It is a circular reference problem.

[`select`](/concepts/stores#select) solves this:

```typescript
dataNeeded$ = this.adapt.select('data', dataAdapter).getDataNeeded();

dataReceived$ = this.dataNeeded$.pipe(
  filter(needed => needed),
  switchMap(() => this.dataService.fetchData()),
  toSource('dataReceived$'),
);

dataStore = this.adapt.init(['data', dataAdapter, initialState], {
  receive: this.dataReceived$,
});
```

## Joining Stores

Stores are treated as independent entities responsible for managing only the state inside of them. But sometimes you need to combine state from multiple stores. Since [`combineLatest` is often inadequate](/concepts/stores#the-problem-with-combinelatest), StateAdapt exports 2 functions to accomplish this: [`joinSelectors`](/concepts/stores#joinselectors) and [`join`](/concepts/stores#join).

### The Problem with `combineLatest`

When multiple stores change state simultaneously, a `combineLatest` that combines state from all of them will fire once for each store instead of once for all of them. This is not performant and requires you to filter out intermediate states where some inputs are fresh but the others are not. Consider this example:

```typescript
numberAdded$ = new Source<number>();

number1$ = this.adapt.initGet(['number1', numberAdapter, 0], {
  add: this.numberAdded$,
});
number2$ = this.adapt.initGet(['number2', numberAdapter, 4000], {
  add: this.numberAdded$,
});

total$ = combineLatest([this.number1$, this.number2$]).pipe(
  map((n1, n2) => n1 + n2),
);
```

Initially, `total$` will emit `4000`, calculated from the initial inputs of `0` and `4000`. If you then call `numberAdded$.next(10)`, `total$` would first recalculate based on inputs of `10` and `4000`, so it would emit `4010`. After that it would get the update from `number2` and calculate from `10` and `4010` and emit the correct number, `4020`. It is a contrived example, but it illustrates the problem.

### `joinSelectors`

[`joinSelectors`](/concepts/stores#joinselectors) is the simplest way to use state from multiple stores:

```typescript
import { joinSelectors } from '@state-adapt/core';
// ...
total$ = joinSelectors(
  this.number1Store,
  this.number2Store,
  (n1, n2) => n1 + n2,
);
```

The first arguments are stores or store selector arrays (see below), and the last argument is the function that calculates the result. When you pass stores as the first arguments, [`joinSelectors`](/concepts/stores#joinselectors) uses the [`getState`](/concepts/stores#getstate) selector from each store. If you want to use a different selector, you can specify it like this

```typescript
total$ = joinSelectors(
  [this.number1Store, 'getNegative'],
  this.number2Store,
  (n1, n2) => n1 + n2,
);
```

TypeScript will autocomplete the name of the selector as you type and correctly infer the types in the result function.

### `join`

[`join`](/concepts/stores#join) is a much heavier solution than [`joinSelectors`](/concepts/stores#joinselectors). When you need to join many selectors from the same stores your code will sometimes be more DRY if you use [`join`](/concepts/stores#join) instead of [`joinSelectors`](/concepts/stores#joinselectors). [`join`](/concepts/stores#join) gives you access to all of each store's selectors and returns a new store-like object with new selectors you define using `createSelector` from _Reselect_:

```typescript
import { createSelector } from 'reselect';
import { join } from '@state-adapt/core';
// ...
number1Number2Store = join(
  this.number1Store,
  this.number2Store,
  (number1Selectors, number2Selectors) => ({
    getTotalNegative1: createSelector(
      number1Selectors.getNegative,
      number2Selectors.getState,
      (n1, n2) => n1 + n2,
    ),
    getTotalNegative2: createSelector(
      number1Selectors.getState,
      number2Selectors.getNegative,
      (n1, n2) => n1 + n2,
    ),
  }),
);
totalNegative1$ = this.number1Number2Store.getTotalNegative1();
totalNegative2$ = this.number1Number2Store.getTotalNegative2();
```
