# Stores

- [Overview](/concepts/stores#overview)
- [`init`](/concepts/stores#init)
- [State Paths](/concepts/stores#state-paths)
- [getId](/concepts/stores#getid)
- [`state$`](/concepts/stores#state)
- [Selectors](/concepts/stores#selectors)
- [`updater`](/concepts/stores#updater)
- [`setter`](/concepts/stores#setter)
- [`watch`](/concepts/stores#watch)
- [Joining Stores](/concepts/stores#joining-stores)

## Overview

Stores do 4 things:

- Define initial state and an adapter to manage it
- Connect sources to adapter state changes
- Use the adapter's selectors to create observables of the selectors' results. These observables chain off the sources so subscriptions are propagated
- Use the adapter's state changes to create synthetic sources for simple, single-store state changes. These are made available as part of the store, so DOM event handlers can call them. See [Synthetic Sources](/concepts/sources#synthetic-sources).

**Stores _do not_ subscribe to sources on their own. Nothing will happen until you subscribe to one of the selector observables.**

## `init`

`init` is a method on `AdaptCommon` that creates stores. There are 4 ways to use it:

![AdaptCommon['init'] Overloads](../assets/adapt-method-jsdoc.png)

The `sources` parameter is worth explaining more. When it is an object, it maps the relationship between state changes and the sources that should trigger them. This object is equivalent to a reducer in _Redux_ or _NgRx_. The property names of the object are the adapter's state change function names. The right-hand side of the object specifies one or more sources that should trigger the state change specified in the property name. To specify multiple sources, pass them in an array, like

```typescript
{
  add: [this.numberAdded$, this.aDifferentNumberAdded$],
}
```

`sources` can also be a single observable or array of observables that gets treated the same as if this was passed in: `{ set: source$ }` or `{ set: [source1$, source2$] }`

This is the default way to use [`init`](/concepts/stores#init) from `'@state-adapt/core'` (or whatever the import path is in your environment. See [Getting Started](<(/getting-started)>)):

```typescript
// ...
  numberStore = this.adapt.init('number', 0);
  constructor(private adapt: AdaptCommon) {}
// ...
```

You will probably never call the [`init`](/concepts/stores#init) method directly. StateAdapt exports a specific function for each environment:

- **Angular:** `import { adapt } from '@state-adapt/angular';`
- **Angular + NgRx:** `import { adapt } from '@state-adapt/ngrx';`
- **Angular + NGXS:** `import { adapt } from '@state-adapt/ngxs';`
- **React (/+ Redux):** `import { useAdapt } from '@state-adapt/react';`

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

## `getId`

In case you need to avoid a path collision and have no way of generating a unique path deterministically, [`getId`](/concepts/stores#getid) will give you a unique id you can append to the path you pass into [`init`](/concepts/stores#init).

## `state$`

[`state$`](/concepts/stores#state) is a default property created on each store. It is an observable of the store's state:

```typescript
numberStore = this.adapt.init('number', 0);
number$ = this.numberStore.state$;
```

## Selectors

If selectors are defined in an adapter they get assigned to properties on the store object with an added `'$'` at the end of the property name. They are observables of the selected state:

```typescript
numberAdapter = createAdapter<number>()({
  selectors: { negative: state => state * -1 },
});
numberStore = this.adapt.init('number', 0, this.numberAdapter);
negativeNumber$ = this.numberStore.negative$;
```

Each selector's observable chains off of all the sources passed into the store. For example, if one of your sources is an observable of an HTTP request, that request will automatically be triggered as soon as you subscribe to any of the selector observables from the store. We recommend keeping your adapters and stores relatively small and focused on one concern so that accessing one part of state does not cause unrelated/unneeded data to be fetched. If necessary, you can also access store selectors that do not chain off of any sources by using the [`watch`](/concepts/stores#watch) method described below.

## `watch`

[`watch`](/concepts/stores#watch) is a method on `AdaptCommon` that returns a store that does not chain off of sources. It takes 2 arguments: The [path](/concepts/stores#state-paths) of the state you are interested in, and the adapter containing the selectors you want to use:

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

Stores are treated as independent entities responsible for managing only the state inside of them. But sometimes you need to combine state from multiple stores. Since [`combineLatest` is often inadequate](/concepts/stores#the-problem-with-combinelatest), StateAdapt exports 2 functions to accomplish this: [`joinSelectors`](/concepts/stores#joinselectors) and [`join`](/concepts/stores#join).

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

total$ = combineLatest([this.number1$, this.number2$]).pipe(map((n1, n2) => n1 + n2));
```

Initially, `total$` will emit `4000`, calculated from the initial inputs of `0` and `4000`. If you then call `numberAdded$.next(10)`, `total$` would first recalculate based on inputs of `10` and `4000`, so it would emit `4010`. After that it would get the update from `number2` and calculate from `10` and `4010` and emit the correct number, `4020`.

### `joinSelectors`

[`joinSelectors`](/concepts/stores#joinselectors) has been deprecated in favor of [`joinStores`](/concepts/stores#joinstores).

[`joinSelectors`](/concepts/stores#joinselectors) is the simplest way to use state from multiple stores:

```typescript
total$ = joinSelectors(this.number1Store, this.number2Store, (n1, n2) => n1 + n2);
```

The first arguments are stores or store selector arrays (see below), and the last argument is the function that calculates the result. If the third argument is not provided, `total$` will end up being an array of each selector's output. When you pass stores as the first arguments, [`joinSelectors`](/concepts/stores#joinselectors) uses the [`state`](/concepts/stores#state) selector from each store. If you want to use a different selector, you can specify it like this:

```typescript
total$ = joinSelectors(
  [this.number1Store, 'negative'],
  this.number2Store,
  (n1, n2) => n1 + n2,
);
```

TypeScript will autocomplete the name of the selector as you type and correctly infer the types in the result function.

### `join`

[`join`](/concepts/stores#join) has been deprecated in favor of [`joinStores`](/concepts/stores#joinstores).

[`join`](/concepts/stores#join) is a heavier solution than [`joinSelectors`](/concepts/stores#joinselectors). When you need to join many selectors from the same stores your code will be more DRY if you use [`join`](/concepts/stores#join) instead of [`joinSelectors`](/concepts/stores#joinselectors). [`join`](/concepts/stores#join) gives you access to all of each store's selectors by allowing you to specify a prefix to prepend to all selector names from each individual store. It returns a new store-like object with new selectors you define using `createSelector` from _Reselect_:

```typescript
numbersStore = join(['one', this.number1Store], ['two', this.number2Store], {
  totalNegative1: s => s.oneNegative + s.twoState,
  totalNegative2: s => s.oneState + s.twoNegative,
});
totalNegative1$ = this.numbersStore.totalNegative1$;
totalNegative2$ = this.numbersStore.totalNegative2$;
```

### `joinStores`

[`joinStores`](/concepts/stores#joinstores) gives you access to all of each store's selectors by allowing you to specify a prefix to prepend to all selector names from each individual store. It returns a new store-like object with new selectors. It also has similar syntax to that of [`joinAdapters`](/concepts/adapters#joinadapters):

```typescript
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

The reason for this is so you can define state logic in adapters instead of inside `joinStores`, which makes it simpler to test. This alternative syntax would be slightly preferrable:

```typescript
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

But it's easy to move from one to the other.
