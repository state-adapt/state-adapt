# Adapters

- [Overview](/concepts/adapters#overview)
- [State Changes](/concepts/adapters#state-changes)
- [Selectors](/concepts/adapters#selectors)
- [`createAdapter`](/concepts/adapters#createadapter)
- [Extending Adapters](/concepts/adapters#extending-adapters)
- [`buildAdapter`](/concepts/adapters#buildadapter)
- [`joinAdapters`](/concepts/adapters#joinadapters)
- [`mapPayloads`](/concepts/adapters#mappayloads)
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
) => ({ ...state }), // New state
```

## Selectors

Selectors are pure functions that calculate derived state or just return a specific piece of state. They take one argument (`State`) and return any type:

```typescript
state => state.property,
```

Since these functions are only referenced and never called in your code, the convention is to name them nouns instead of verbs (e.g. `state` instead of `getState`).

## `createAdapter`

createAdapter provides type inference when creating state adapters, which is convenient because every state change and selector starts with the same type (`State`), and every state change returns that type as well. Here is an example using createAdapter:

```typescript
import { createAdapter } from '@state-adapt/core';

const numberAdapter = createAdapter<number>()({
  add: (state, n: number) => state + n,
  subtract: (state, n: number) => state - n,
  selectors: {
    negative: state => state * -1,
  },
});
```

Defining selectors is optional.

Every adapter comes with 2 default state reactions:

- `set` replaces the old state with a new one
- `reset` resets to the original state the adapter was initialized with

Every adapter also comes with a default selector:

- `state` returns the top-level state value

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

## `buildAdapter`

`buildAdapter` is called with an initial adapter, then can be called again and again with more objects inheriting from previous objects, until a final empty call `()` to get the final built adapter:

```typescript
import { buildAdapter } from '@state-adapt/core';
import { numberAdapter } from './number.adapter';

const numberStringAdapter = buildAdapter<number>()(numberAdapter)({
  // Define more stuff
})(([selectors, reactions]) => ({
  // Define more stuff
}))({
  // etc
})(); // End
```

The first call creates a new object, but after that, every object passed in is looped over and used to mutate the original new object.

[`buildAdapter`](/concepts/adapters#buildadapter) takes 3 possible arguments in each call (after the first):

1. A selectors object
2. A function taking in a tuple of `[selectors, reactions]` and returning new reactions
3. A nested object defining grouped state reactions

Let's look at each of these.

### 1. Selectors

Selectors should be defined before anything else, since they can be used in reactions, and it helps to have a consistent pattern to make things easily findable.

[`buildAdapter`](/concepts/adapters#buildadapter) provides full selector memoization and a default `state` selector (after the first call). The selectors defined in the first call each receive a state object to select against. Each subsequent selector block has access to all selectors previously defined. To return all the selectors combined into an adapter, call it a final time with no parameter.

Example:

```typescript
import { buildAdapter } from '@state-adapt/core';

const stringAdapter = buildAdapter<string>()()({
  reverse: s => s.state.split('').reverse().join(''),
})({
  isPalendrome: s => s.reverse === s.state,
})();
```

`s` is typed as an object with properties with the same names as all the selectors defined previously, and typed with each corresponding selector's return type. Internally, [`buildAdapter`](/concepts/adapters#buildadapter) uses a `Proxy` to detect which selectors your new selector functions are accessing in order memoize them efficiently.

Why `s`? Well, should the object (`s`) passed into each selector function be named `selectors`, `state` or `selectorState`? In reality it's just a proxy, so none of these really make sense. So, the convention is `s`, since it's short and the only letter all the possible meanings share.

Note 1: [`buildAdapter`](/concepts/adapters#buildadapter) is another reason for naming selectors as nouns instead of verbs: Either it would need to do extra, unnecessary processing to add `'get'`s in the `Proxy` property accessor method to find the correct selectors, or developers would need to treat verbs as nouns in their selector functions, which would be awkward: `s => s.getNegative.toString()`.

Note 2: Here's how the above selectors would have been defined using a Redux-like `createSelector` function:

```tsx
import { createSelector } from 'reselect'; // or whatever

// Need a function that returns the selector in order to be
// reusable and independently memoized:
const getSelectReverse = (selectState: (state: string) => string) =>
  createSelector(selectState, state => state.split('').reverse().join(''));

const getSelectIsPalendrome = (selectState: (state: string) => string) =>
  createSelector(
    selectState,
    getSelectReverse(selectState),
    (state, reverse) => state === reverse,
  );

// ...
// Before using for some specific state
const selectReverse = getSelectReverse(selectSpecificState);
const selectIsPalendrome = getSelectIsPalendrome(selectSpecificState);
```

or in RxJS:

```tsx
import { map, combineLatest, distinctUntilChanged } from 'rxjs';

const getReverse = (state: string) => state.split('').reverse().join('');
const getIsPalendrome = ([state, reverse]: [string, string]) =>
  state === reverse;

// ...
// Using in a specific piece of state
const reverse$ = specificState$.pipe(map(getReverse), distinctUntilChanged());
const isPalendrome$ = combineLatest([specificState$, reverse$]).pipe(
  map(getIsPalendrome),
  distinctUntilChanged(),
);
```

### 2. Reactions

The function returning new reactions can be used like this:

```typescript
import { buildAdapter } from '@state-adapt/core';
import { numberAdapter } from './number.adapter';

const numberStringAdapter = buildAdapter<number>()(numberAdapter)({
  negativeStr: s => s.negative.toString(),
})(([selectors, reactions]) => ({
  setToNegative: state => selectors.negative(state),
}))();
```

`setToNegative` becomes a reaction on `numberStringAdapter` that multiplies the state by `-1` (the return of `selectors.negative(state)`).

Selectors used when defining new reactions must be called as functions and will not be memoized. If efficiency is critical, you might want to put the derived state in the action payload for the state change.

### 3. Nested Reactions

The nested object defining grouped state reactions is for nested states. Let's say you had an adapter like this:

```typescript
import { buildAdapter } from '@state-adapt/core';
import { numberAdapter } from './number.adapter';

interface NumbersState {
  coolNumber: number;
  weirdNumber: number;
}

const numbersAdapter = buildAdapter<NumbersState>()({
  setCoolNumber: (state, newCoolNumber: number) => ({
    ...state,
    coolNumber: newCoolNumber,
  }),
  setWeirdNumber: (state, newWeirdNumber: number) => ({
    ...state,
    weirdNumber: newWeirdNumber,
  }),
})();
```

You could define a group state change that sets both `coolNumber` and `weirdNumber` like this:

```typescript
const numbersAdapter = buildAdapter<NumbersState>()({
  setCoolNumber: (state, newCoolNumber: number) => ({
    ...state,
    coolNumber: newCoolNumber,
  }),
  setWeirdNumber: (state, newWeirdNumber: number) => ({
    ...state,
    weirdNumber: newWeirdNumber,
  }),
})({
  setBothNumbers: {
    coolNumber: numberAdapter.set,
    weirdNumber: numberAdapter.set,
  },
})();
```

`setBothNumbers` becomes a reaction on `numbersAdapter` that sets both `coolNumber` and `weirdNumber` to the same payload passed into `setBothNumbers`. The new reaction's payload type will be the intersection of the payload types from the reactions used.

The reason grouped reactions are useful is because if you tried to reuse `setCoolNumber` and `setWeirdNumber`, you would end up calculating 2 new states:

```typescript
const numbersAdapter = buildAdapter<NumbersState>()({
  setCoolNumber: (state, newCoolNumber: number) => ({
    ...state,
    coolNumber: newCoolNumber,
  }),
  setWeirdNumber: (state, newWeirdNumber: number) => ({
    ...state,
    weirdNumber: newWeirdNumber,
  }),
})(([selectors, reactions]) => ({
  setBothNumbers: (state, newNumber: number) =>
    reactions.setWeirdNumber(reactions.setCoolNumber(state)),
}))();
```

If you tried to calculate a single new state, you would override properties from the first change with the unchanged properties from the second change, so passing the result of one reaction to the other is the only way to ensure consistent state without duplicating state change logic in the new state reaction. But this is inefficient.

State change groups are able to efficiently calculate a single new state.

## `joinAdapters`

Similar data types will have similar state management logic. Take this example we just saw above from [`buildAdapter`](/concepts/adapters#buildadapter):

```typescript
import { buildAdapter } from '@state-adapt/core';
import { numberAdapter } from './number.adapter';

interface NumbersState {
  coolNumber: number;
  weirdNumber: number;
}

const numbersAdapter = buildAdapter<NumbersState>()({
  setCoolNumber: (state, newCoolNumber: number) => ({
    ...state,
    coolNumber: newCoolNumber,
  }),
  setWeirdNumber: (state, newWeirdNumber: number) => ({
    ...state,
    weirdNumber: newWeirdNumber,
  }),
})();
```

See how both properties are numbers and end up with the same state change? What would be awesome is if we could define individual adapters for these properties and automatically inheret the state changes for those properties in our parent state adapter:

```typescript
import { joinAdapters } from '@state-adapt/core';
import { numberAdapter } from './number.adapter';

interface NumbersState {
  coolNumber: number;
  weirdNumber: number;
}

const numbersAdapter = joinAdapters<NumbersState>()({
  coolNumber: numberAdapter,
  weirdNumber: numberAdapter,
})();
```

This will produce the same adapter as in the previous code snippet, plus some extra things, like this:

```tsx
const numbersAdapter = buildAdapter<NumbersState>()({
  setCoolNumber: (state, newCoolNumber: number) => ({
    ...state,
    coolNumber: newCoolNumber,
  }),
  setWeirdNumber: (state, newWeirdNumber: number) => ({
    ...state,
    weirdNumber: newWeirdNumber,
  }),
  update: (state, update: Partial<NumbersState>) => ({ ...state, ...update }),
})({
  coolNumber: s => s.state.coolNumber,
  weirdNumber: s => s.state.weirdNumber,
})();
```

[`joinAdapters`](/concepts/adapters#joinadapters) returns the same builder function as [`buildAdapter`](/concepts/adapters#buildadapter). So we can add our grouped reaction just like we did in the [`buildAdapter`](/concepts/adapters#buildadapter) example:

```typescript
import { joinAdapters } from '@state-adapt/core';
import { numberAdapter } from './number.adapter';

interface NumbersState {
  coolNumber: number;
  weirdNumber: number;
}

const numbersAdapter = joinAdapters<NumbersState>()({
  coolNumber: numberAdapter,
  weirdNumber: numberAdapter,
})({
  setBothNumbers: {
    coolNumber: numberAdapter.set,
    weirdNumber: numberAdapter.set,
  },
})();
```

All selectors from `number` adapter (see [`createAdapter`](/concepts/adapters#createadapter)) will get prepended with the namespace we've defined. So we get these selectors:

```typescript
{
  coolNumberNegative: state => state.coolNumber * -1,
  weirdNumberNegative: state => state.coolNumber * -1,
}
```

All state reactions have the namespace inserted after the first word. So we get these reactions:

```typescript
{
  addCoolNumber: (state, n: number) => ({...state, coolNumber: state.coolNumber + n}),
  subtractCoolNumber: (state, n: number) => ({...state, coolNumber: state.coolNumber - n}),
  addWeirdNumber: (state, n: number) => ({...state, weirdNumber: state.weirdNumber + n}),
  subtractWeirdNumber: (state, n: number) => ({...state, weirdNumber: state.weirdNumber - n}),
}
```

Here are some example state change names and what they'd end up as with `joinAdapters`:

- `set` => `setFeature`
- `setLoadingToTrue` => `setFeatureLoadingToTrue`
- `toggle` => `toggleFeature`
- `decrementPopulation` => `decrementFeaturePopulation`
- `setTo5` => `setFeatureTo5`

We also get an `update` function that allows passing a partial of `State` that will be spread onto state.

Lastly, if you have a large state model and don't want to define an adapter for every property, [`joinAdapters`](/concepts/adapters#joinadapters) takes in a 2nd type argument for you to specify which properties to exclude:

```typescript
import { joinAdapters } from '@state-adapt/core';
import { numberAdapter } from './number.adapter';

interface NumbersState {
  coolNumber: number;
  weirdNumber: number;
  a: string;
  b: any;
  c: Record<string, undefined>;
}

const numbersAdapter = joinAdapters<NumbersState, 'a' | 'b' | 'c'>()({
  coolNumber: numberAdapter,
  weirdNumber: numberAdapter,
})();
```

## `mapPayloads`

`mapPayloads` takes in an object with adapter reactions as the first argument, an object with payload mappers as the second argument, and returns the mapped reactions. For example, if you had this adapter:

```typescript
const numberAdapter = createAdapter<number>()({
  add: (state, n: number) => state + n,
  subtract: (state, n: number) => state - n,
  selectors: {
    negative: state => state * -1,
  },
});
```

You could change the payloads of any of the reactions with `mapPayloads`:

```typescript
const addFromStringAdapter = mapPayloads(numberAdapter, {
  add: (nStr: string) => +nStr,
});
```

That would would return an object like this:

```typescript
{
  add: (state: number, nStr: string) => +nStr,
}
```

This is useful with [`buildAdapter`](/concepts/adapters#buildadapter), because when defining new reactions you only return the new reactions. So you could do something like this:

```typescript
const numberAdapter = buildAdapter<number>()({
  add: (state, n: number) => state + n,
  subtract: (state, n: number) => state - n,
  selectors: {
    negative: state => state * -1,
  },
})(([selectors, reactions]) =>
  mapPayloads(
    {
      add5: reactions.add, // add5 expects a payload still
      add10: reactions.add, // add10 expects a payload still
      add15: reactions.add, // add15 expects a payload still
    },
    {
      add5: () => 5, // add5 is now a reaction that doesn't take a payload
      add10: () => 10, // add10 is now a reaction that doesn't take a payload
      add16: () => 15, // add15 is now a reaction that doesn't take a payload
    },
  ),
)();
```

The result would be the same as defining an adapter like this:

```typescript
const numberAdapter = createAdapter<number>()({
  add: (state, n: number) => state + n,
  add5: state => state + 5,
  add10: state => state + 10,
  add15: state => state + 15,
  subtract: (state, n: number) => state - n,
  selectors: {
    negative: state => state * -1,
  },
});
```

[`mapPayloads`](/concepts/adapters#mappayloads) is most useful when you want to define an adapter with ideal payloads, but actually need an adapter that takes in annoying payload types. For example, if you are receiving data from an API, you might want to write an adapter like this:

```typescript
const dataAdapter = createAdapter<WithData>()({
  receiveData: (state, data: Data) => ({ ...state, data }),
});
```

But then you might have an `HTTP` source like this:

```typescript
interface ApiData {
  weirdly: {
    nested: {
      response: {
        shape: {
          with: {
            data: Data;
          };
        };
      };
    };
  };
}
```

You would like to keep your `dataAdapter` defined how it is, so you can use `mapPayloads` here:

```typescript
const dataAdapter = createAdapter<WithData>()({
  receiveData: (state, data: Data) => ({ ...state, data }),
});

const apiDataAdapter = buildAdapter<WithData>()(dataAdapter)(([s, reactions]) =>
  mapPayloads(reactions, {
    receiveData: (data: ApiData) =>
      data.weirdly.nested.response.shape.with.data,
  }),
);
```

This is preferable over either modifying the simpler `dataAdapter` _or_ modifying the HTTP source observable with `.pipe(map(...))`. Sources should be as simple as possible. Adapters are the perfect place to put mapping logic.

Note: If you use the same reaction name, like in this example, make sure it is in a separate [`buildAdapter`](/concepts/adapters#buildadapter) call from the one that defined it. Otherwise the original reaction will be redefined when [`buildAdapter`](/concepts/adapters#buildadapter) mutates the adapter. But if you use `mapPayloads` in a separate [`buildAdapter`](/concepts/adapters#buildadapter) call, the original adapter object will be unaffected, since [`buildAdapter`](/concepts/adapters#buildadapter) always creates a new initial object.

## Adapter Creator Libraries

State adapters allow state management patterns to be easily reusable.

Similar to how components enabled awesome component libraries for modern UI frameworks, state adapters open up the opportunity for adapter libraries.

StateAdapt has created a few core adapters, and plans to create many more. See the [core adapters documentation](/adapters/core).
