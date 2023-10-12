# Stores

- [Overview](/concepts/stores#overview)
- [`init`](/concepts/stores#init)
- [State Paths](/concepts/stores#state-paths)
- [getId](/concepts/stores#getid)
- [Selectors](/concepts/stores#selectors)
- [`watch`](/concepts/stores#watch)
- [Joining Stores](/concepts/stores#joining-stores)

## Overview

Stores do 4 things:

- Define initial state and an adapter to manage it
- Use sources to trigger adapter state changes
- Use the adapter's selectors to create observables of selector results. These observables chain off the sources so subscriptions are propagated
- Use the adapter's state changes to create synthetic sources for simple, single-store state changes. These are made available as part of the store, so DOM event handlers can call them. See [Synthetic Sources](/concepts/sources#synthetic-sources).

**Stores _do not_ subscribe to sources on their own. Nothing will happen until you subscribe to one of the selector observables.**

## `init`

`init` is a method on `Adapt` that creates stores. There are 4 ways to use it:

![Adapt['init'] Overloads](./assets/adapt-method-jsdoc.png)

The `sources` parameter needs explaining. When it is an object, it maps relationships between state changes and the sources that should trigger them. This object is equivalent to a reducer in _Redux_ or _NgRx_. The property names of the object are the adapter's state change function names. The right-hand side of the object specifies one or more sources that should trigger the state change specified in the property name. To specify multiple sources, pass them in an array, like

```typescript
{
  add: [this.numberAdded$, this.aDifferentNumberAdded$],
}
```

`sources` can also be a single observable or array of observables that gets treated the same as if this was passed in like `{ set: source$ }` or `{ set: [source1$, source2$] }`

This is the default way to use [`init`](/concepts/stores#init) from `'@state-adapt/rxjs'`:

```typescript
import { Adapt } from '@state-adapt/rxjs';
// ...
  numberStore = this.adapt.init('number', 0);
  constructor(private adapt: Adapt) {}
// ...
```

You will probably never call the [`init`](/concepts/stores#init) method directly. StateAdapt exports a specific function for each environment:

- **Angular:** `import { adapt } from '@state-adapt/angular';`
- **Angular + NgRx:** `import { adaptNgrx } from '@state-adapt/ngrx';`
- **Angular + NGXS:** `import { adaptNgxs } from '@state-adapt/ngxs';`
- **React (/+ Redux):** `import { useAdapt } from '@state-adapt/react';`

The signature for each of these is the same as [`init`](/concepts/stores#init)'s.

## State Paths

The [path](/concepts/stores#state-paths) string passed into [`init`](/concepts/stores#init) specifies the location in the global store you will find the state for the store being created. StateAdapt splits this string at periods `'.'` and uses the resulting array to define an object path for the state. For example, with an initial state of `0`, the following paths will create the following objects for the global store:

```typescript
'number' ==> { number: 0 }

'featureA.number' ==> { featureA: { number: 0 } }

'featureA.featureB.number' ==> { featureA: { featureB: { number: 0 } } }
```

Each store completely owns its own state. If more than one store tries to use the same path, StateAdapt will throw this error:

`Path '${path}' collides with '${existingPath}', which has already been initialized as a state path.`

This applies both to paths that are identical as well as paths that are subtrings of each other. For example, if `'featureA'` is already being used by a store and then another store tried to initialize at `'featureA.number'`, that error would be thrown.

## `getId`

In case you need to avoid a path collision and have no way of generating a unique path deterministically, [`getId`](/concepts/stores#getid) will give you a unique id you can append to the path you pass into [`init`](/concepts/stores#init).

## Selectors

Selectors defined in an adapter get assigned to properties on the store object with an added `'$'` at the end of the property name. They are observables of the selected state:

```typescript
numberAdapter = createAdapter<number>()({
  selectors: { negative: state => state * -1 },
});
numberStore = this.adapt.init(['number', 0], this.numberAdapter);
negativeNumber$ = this.numberStore.negative$;
state$ = this.numberStore.state$; // Every adapter gets a `state` selector
```

Each selector's observable chains off of all the sources passed into the store. For example, if one of your sources is an observable of an HTTP request, that request will automatically be triggered as soon as you subscribe to any of the selector observables from the store. If necessary, you can access store selectors that do not chain off of any sources by using the [`watch`](/concepts/stores#watch) method described next.

## `watch`

[`watch`](/concepts/stores#watch) is a method on `Adapt` that returns a store that does not chain off of sources. It takes 2 arguments: The [path](/concepts/stores#state-paths) of the state you are interested in, and the adapter containing the selectors you want to use:

```typescript
import { watch } from '@state-adapt/angular';
// ...
negative$ = watch('number', numberAdapter).negative$;
```

[`watch`](/concepts/stores#watch) is useful in 2 situations primarily: [Accessing state without subscribing](/concepts/stores#1-accessing-state-without-subscribing) and [accessing state for a source](/concepts/stores#2-accessing-state-for-a-source).

### 1. Accessing State without Subscribing

[`watch`](/concepts/stores#watch) enables accessing state without subscribing to sources. For example, if your adapter manages the `loading` state for an HTTP request and you need to know if the request is loading _before_ the user is interested in the data, [`watch`](/concepts/stores#watch) can give you access to it without triggering the request. This is probably not common, but [`watch`](/concepts/stores#watch) makes it possible.

### 2. Accessing State for a Source

It would be impossible for a source itself to access state from the store without [`watch`](/concepts/stores#watch) because it would require using the store before it had been defined. The following example demonstrates this:

```typescript
dataReceived$ = this.dataStore.dataNeeded$.pipe(
  // Error: Property 'dataStore' is used before its initialization.
  filter(needed => needed),
  switchMap(() => this.dataService.fetchData()),
  toSource('dataReceived$'),
);

dataStore = adapt(['data', initialState, dataAdapter], {
  receive: this.dataReceived$,
});
```

In this example `dataNeeded$` comes from a selector that returns `true` if data needs to be fetched. This could be useful if the user is given a refresh button which triggers a state change back to the initial state. Since the `dataReceived$` source chains off of `dataNeeded$`, this reset would automatically trigger the request to be made again. Very reactive!

However, `dataReceived$` needs to reference `this.dataStore.dataNeeded$`, which is impossible because `dataStore` uses `dataReceived$`. It is a circular reference problem.

[`watch`](/concepts/stores#watch) solves this:

```typescript
dataNeeded$ = watch('data', dataAdapter).dataNeeded$;

dataReceived$ = this.dataNeeded$.pipe(
  filter(needed => needed),
  switchMap(() => this.dataService.fetchData()),
  toSource('dataReceived$'),
);

dataStore = adapt(['data', initialState, dataAdapter], {
  receive: this.dataReceived$,
});
```

## Joining Stores

Stores are treated as independent entities responsible for managing only the state inside of them. But sometimes you need to combine state from multiple stores. Since [`combineLatest` is often inadequate](/concepts/stores#the-problem-with-combinelatest), StateAdapt has [`joinStores`](/concepts/stores#joinstores).

### The Problem with `combineLatest`

When multiple stores change state simultaneously, a `combineLatest` that combines state from all of them will fire once for each store instead of once for all of them. This is not performant and requires you to filter out intermediate states where some inputs are new while others are old. Consider this example:

```typescript
numberAdded$ = new Source<number>();

number1$ = adapt(['number1', 0, numberAdapter], {
  add: this.numberAdded$,
}).state$;
number2$ = adapt(['number2', 4000, numberAdapter], {
  add: this.numberAdded$,
}).state$;

total$ = combineLatest([this.number1$, this.number2$]).pipe(
  map((n1, n2) => n1 + n2),
);
```

Initially, `total$` will emit `4000`, calculated from the initial inputs of `0` and `4000`. If you then call `numberAdded$.next(10)`, `total$` would first recalculate based on inputs of `10` and `4000`, so it would emit `4010`. After that it would get the update from `number2` and calculate from `10` and `4010` and emit the correct number, `4020`.

### `joinStores`

[`joinStores`](/concepts/stores#joinstores) gives you access to all of each store's selectors by allowing you to specify a prefix to prepend to all selector names from each individual store. It returns a new store-like object with new selectors. It also has similar syntax to that of [`joinAdapters`](/concepts/adapters#joinadapters):

```typescript
import { joinStores } from '@state-adapt/rxjs';
// ...
numbersStore = joinStores({
  one: this.number1Store,
  two: this.number2Store,
})({
  totalNegative1: s => s.oneNegative + s.twoState,
  totalNegative2: s => s.oneState + s.twoNegative,
})();

totalNegative1$ = this.numbersStore.totalNegative1$;
totalNegative2$ = this.numbersStore.totalNegative2$;
```

The reason for the similar syntax is so you can define state logic in adapters instead of inside `joinStores`, which makes it simpler to test. This alternative syntax would be slightly preferrable:

```typescript
import { joinAdapters } from '@state-adapt/core';
import { joinStores } from '@state-adapt/rxjs';

const numbersStore = joinAdapters<NumbersState>()({
  one: numberAdapter,
  two: numberAdapter,
})({
  totalNegative1: s => s.oneNegative + s.twoState,
  totalNegative2: s => s.oneState + s.twoNegative,
})();
// ...
numbersStore = joinStores({
  one: this.number1Store,
  two: this.number2Store,
})(numbersStore.selectors)();

totalNegative1$ = this.numbersStore.totalNegative1$;
totalNegative2$ = this.numbersStore.totalNegative2$;
```

But it's easy to move from one to the other, so don't feel bad about defining selectors inside [`joinStores`](/concepts/stores#joinstores) itself.
