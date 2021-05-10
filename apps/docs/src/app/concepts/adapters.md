# Adapters

- [Overview](/concepts/adapters#overview)
- [State Changes](/concepts/adapters#state-changes)
- [Selectors](/concepts/adapters#selectors)
- [`createAdapter`](/concepts/adapters#createadapter)
- [Extending adapters](/concepts/adapters#extending-adapters)
- [Basic adapter](/concepts/adapters#basic-adapter)
- [Adapter creator libraries](/concepts/adapters#adapter-creator-libraries)

## Overview

Adapters are objects containing 2 kinds of reusable state management patterns: State changes and selectors.

## State Changes

State change functions are pure functions that implement ways state can change. They take 3 arguments and return a new state:

```typescript
(
  state, // Current state
  payload, // Data needed to calculate new state
  initialState, // State the adapter was initialized with
) => ({...state}), // New state
```

## Selectors

Selectors are pure functions that calculate derived state or just return a specific piece of state. They take one argument (`State`) and return any type:

```typescript
state => state.property,
```

## `createAdapter`

createAdapter provides type inference when creating state adapters, which is convenient because every state change and selector starts with the same type (`State`), and every state change returns that type as well. Here is an example using createAdapter:

```typescript
import { createAdapter } from '@state-adapt/core';

const numberAdapter = createAdapter<number>()({
  add: (state, n: number) => state + n,
  subtract: (state, n: number) => state - n,
  selectors: {
    getNegative: state => state * -1,
  },
});
```

StateAdapt creates a default selector called `getState` for every adapter when it is initialized into a store. Defining your own selectors is optional.

## Extending adapters

You can use extend the functionality of existing adapters when creating new adapters. Here is an example that extends the number adapter from above:

```typescript
import { createAdapter } from '@state-adapt/core';
import { numberAdapter } from './number.adapter';

const numberStringAdapter = createAdapter<number>()({
  ...numberAdapter,
  addFromStr: (state, str: string) => numberAdapter.add(state, +str),
  selectors: {
    ...numberAdapter.selectors,
    getStateStr: state => state.toString(),
  },
});
```

StateAdapt will memoize selectors passed into adapters, but when composing selectors you will need to use Reselect's createSelector if you want memoization at every level:

```typescript
import { createSelector } from 'reselect';
import { createAdapter } from '@state-adapt/core';
import { numberAdapter } from './number.adapter';

const numberStringAdapter = createAdapter<number>()({
  ...numberAdapter,
  selectors: {
    ...numberAdapter.selectors,
    getNegativeStr: createSelector(
      numberAdapter.selectors.getNegative,
      negative => negative.toString(),
    ),
  },
});
```

## Basic adapter

StateAdapt's core library exposes a function called `createBasicAdapter`. This function creates an adapter that has extremely common state changes. Here is the source code for that function:

```typescript
import { createAdapter } from './create-adapter.function';

export function createBasicAdapter<T>() {
  return createAdapter<T>()({
    set: (state, newState: T) => newState,
    update: (state, update: Partial<T>) => ({ ...state, ...update }),
    reset: (state, payload, initialState) => initialState,
  });
}
```

`set` replaces the old state with a new one

`update` replaces specific properties of the old state by spreading the object passed in

`reset` resets to the original state the adapter was initialized with

## Adapter creator libraries

Coming soon
