# Type Alias: Adapter\<State, S, R\>

> **Adapter**\<`State`, `S`, `R`\> = `R` & `WithSelectors`\<`S`\>

Defined in: [src/lib/adapters/adapter.type.ts:53](https://github.com/state-adapt/state-adapt/blob/4ff8540684d6d76a52452612f8fa44ffd7c6016a/libs/core/src/lib/adapters/adapter.type.ts#L53)

`Adapter` is a type of object containing 2 kinds of reusable state management patterns: State changes and selectors.

State change functions are pure functions that implement ways state can change. They take 3 arguments and return a new state:

```typescript
(
  state, // Current state
  payload, // Data needed to calculate new state
  initialState, // State the adapter was initialized with
) => ({ ...state }), // New state
```

Selectors are pure functions that calculate derived state or just return a specific piece of state. They take one argument (`State`) and return any type:

```typescript
state => state.property,
```

#### Example: Basic adapter

```typescript
import { Adapter } from '@state-adapt/core';
type State = number;

const adapter = {
  set: (state: State, payload: State) => payload,
  reset: (state: State, payload: any, initialState: State) => initialState,
  selectors: {
    state: (state: State) => state,
  },
} satisfies Adapter<State, any, any>;
```

## Type Parameters

### State

`State`

### S

`S` *extends* `Selectors`\<`State`\>

### R

`R` *extends* `ReactionsWithSelectors`\<`State`, `S`\>
