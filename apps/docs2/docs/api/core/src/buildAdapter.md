---
definedIn: https://github.com/state-adapt/state-adapt/blob/4e457fa33331f265d75eaddb646761782498dd8e/libs/core/src/lib/adapters/build-adapter.function.ts#L110
---

# Function: buildAdapter()

> **buildAdapter**\<`State`\>(): \<`S`, `R`\>(`reactionsWithSelectors`) => `NewBlockAdder`\<`State`, `WithStateSelector`\<`State`, `S`\>, `ReactionsWithoutSelectors`\<`State`, `R` & `BasicAdapterMethods`\<`State`\>\>\>

Defined in: [src/lib/adapters/build-adapter.function.ts:110](https://github.com/state-adapt/state-adapt/blob/4e457fa33331f265d75eaddb646761782498dd8e/libs/core/src/lib/adapters/build-adapter.function.ts#L110)

`buildAdapter` is called with an initial adapter, then can be called again and again with more objects inheriting from previous objects,
until a final empty call `()` to get the final built adapter:

```typescript
import { buildAdapter } from '@state-adapt/core';
import { numberAdapter } from './number.adapter';

const numberStringAdapter = buildAdapter<number>()(numberAdapter)({
  // Define more selectors
})(([selectors, reactions]) => ({
  // Define more state changes
}))({
  // Define grouped state changes
})(); // End
```

The first call creates a new object, but after that, every object passed in is looped over and used to mutate the original new object.

buildAdapter takes 3 possible arguments in each call (after the first):

1. A selectors object
2. A function taking in a tuple of `[selectors, reactions]` and returning new reactions
3. A nested object defining grouped state reactions

### 1. Selectors

`buildAdapter` provides full selector memoization and a default `state` selector (after the first call).
The selectors defined in the first call each receive a state object to select against. Each subsequent selector block has access to all
selectors previously defined. To return all the selectors combined into an adapter, call it a final time with no parameter.

#### Example: Basic selectors

```typescript
import { buildAdapter } from '@state-adapt/core';

const stringAdapter = buildAdapter<string>()({})({
  reverse: s => s.state.split('').reverse().join(''),
})({
  isPalendrome: s => s.reverse === s.state,
})();
```

`s` is typed as an object with properties with the same names as all the selectors defined previously, and typed with each corresponding selector's
return type. Internally, `buildAdapter` uses a `Proxy` to detect which selectors your new selector functions are
accessing in order memoize them efficiently.

### 2. Reactions

#### Example: Basic Reactions

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

### 3. Grouped Reactions

The nested object defining grouped state reactions is for nested states. In the following example, a group state reaction called `setBothNumbers` will set both `coolNumber` and `weirdNumber` to the same payload passed into the new `setBothNumbers` reaction.

#### Example: Grouped Reactions

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

The new reaction's payload type will be the intersection of the payload types from the reactions used, except when one of the payloads is `void`, in which case it will be ignored in the payload intersection.

## Type Parameters

### State

`State`

## Returns

> \<`S`, `R`\>(`reactionsWithSelectors`): `NewBlockAdder`\<`State`, `WithStateSelector`\<`State`, `S`\>, `ReactionsWithoutSelectors`\<`State`, `R` & `BasicAdapterMethods`\<`State`\>\>\>

### Type Parameters

#### S

`S` *extends* `Selectors`\<`State`\>

#### R

`R` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

### Parameters

#### reactionsWithSelectors

[`Adapter`](Adapter.md)\<`State`, `S`, `R`\> = `...`

### Returns

`NewBlockAdder`\<`State`, `WithStateSelector`\<`State`, `S`\>, `ReactionsWithoutSelectors`\<`State`, `R` & `BasicAdapterMethods`\<`State`\>\>\>
