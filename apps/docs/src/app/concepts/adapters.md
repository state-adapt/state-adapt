# Adapters

- [Overview](/concepts/adapters#overview)
- [State Changes](/concepts/adapters#state-changes)
- [Selectors](/concepts/adapters#selectors)
- [`createAdapter`](/concepts/adapters#createadapter)
- [Extending Adapters](/concepts/adapters#extending-adapters)
- [`createSelectors`](/concepts/adapters#createselectors)
- [Adapter Creator Libraries](/concepts/adapters#adapter-creator-libraries)

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

Since these functions are only referenced and never called in your code, the convention is to name them nouns instead of verbs (e.g. `state` instead of `getState`). Another reason is explained in [`createSelectors`](/concepts/adapters#createselectors).

## `createAdapter`

createAdapter provides type inference when creating state adapters, which is convenient because every state change and selector starts with the same type (`State`), and every state change returns that type as well. Here is an example using createAdapter:

```typescript
import { createAdapter } from '@state-adapt/core';

const numberAdapter = createAdapter<number>()({
  // Notice the first empty call—TypeScript requires it
  add: (state, n: number) => state + n,
  subtract: (state, n: number) => state - n,
  selectors: {
    negative: state => state * -1,
  },
});
```

Defining selectors is optional.

Every adapter comes with 4 default state reactions:

`set` replaces the old state with a new one

`update` replaces specific properties of the old state by spreading the object passed in

`reset` resets to the original state the adapter was initialized with

`noop` does nothing; it just allows sources to log in Redux Devtools

Every adapter also comes with a default selector:

`state` returns the top-level state value

## Extending Adapters

You can extend the functionality of existing adapters when creating new adapters. Here is an example that extends the number adapter from above:

```typescript
import { createAdapter } from '@state-adapt/core';
import { numberAdapter } from './number.adapter';

const numberStringAdapter = createAdapter<number>()({
  ...numberAdapter,
  addFromStr: (state, str: string) => numberAdapter.add(state, +str),
  selectors: {
    ...numberAdapter.selectors,
    stateStr: state => state.toString(),
  },
});
```

## `createSelectors`

`createAdapter` memoizes selectors passed into the `selectors` property, but it only does so shallowly. `createSelectors` provides full selector memoization and a default `state` selector (after the first argument). It takes up to 7 selector objects as arguments, each one receiving all of the selectors from the previous selector objects.

```typescript
import { createSelectors, createAdapter } from '@state-adapt/core';

const selectors = createSelectors<string>()(
  {
    reverse: s => s.split('').reverse().join(''),
  },
  {
    isPalendrome: s => s.reverse === s.state,
  },
);

const stringAdapter = createAdapter<string>()({ selectors });
```

Reuse selectors from anywhere:

```typescript
import { createAdapter, createSelectors } from '@state-adapt/core';
import { numberAdapter } from './number.adapter';

const selectors = createSelectors(numberAdapter.selectors, {
  negative: s => s.negative.toString(),
});

const numberStringAdapter = createAdapter<number>()({
  ...numberAdapter,
  selectors,
});
```

`s` is typed the same as the selectors object passed in as the first argument, except using the return type of each selector instead of the selector itself. Internally, `createSelectors` uses a `Proxy` to detect which selectors your new selector functions are accessing in order memoize them efficiently. You could think of `s` as referencing either the selectors object you passed in, or a derived state object created by calling those selectors for each object key. This dual reference is why the convention is to name it `s` instead of either `selectors` or `state`.

`createSelectors` is another reason for naming selectors as nouns instead of verbs: Either it would need to do extra, unnecessary processing to add `'get'`s in the `Proxy` property accessor method to find the correct selectors, or developers would need to treat verbs as nouns in their selector functions, which would be awkward: `s => s.getNegative.toString()`.

Note: If you get this TypeScript error when using the output of `createSelectors` in an adapter:

```
The inferred type of this node exceeds the maximum length the compiler will serialize. An explicit type annotation is needed.
```

Or this error:

```
Type instantiation is excessively deep and possibly infinite.
```

All you have to do is spread the selectors into a new object:

```typescript
const numberStringAdapter = createAdapter<number>()({
  ...numberAdapter,
  selectors: { ...selectors },
});
```

This forces TypeScript to break the nested type references created in `createSelectors` and understand `selectors` as a flat object instead. If your selector chain is long enough, you might need to break it up into multiple calls to `createSelectors`.

## Adapter Creator Libraries

Coming soon
