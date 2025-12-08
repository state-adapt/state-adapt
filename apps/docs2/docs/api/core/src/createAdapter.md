---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/core/src/lib/adapters/create-adapter.function.ts#L66
---

# Function: createAdapter()

> **createAdapter**\<`State`\>(): \<`S`, `R`\>(`adapter`) => `InitializedAdapter`\<`State`, `S`, `R`\>

Defined in: [src/lib/adapters/create-adapter.function.ts:66](https://github.com/state-adapt/state-adapt/blob/main/libs/core/src/lib/adapters/create-adapter.function.ts#L66)

`createAdapter` is a function that takes an [Adapter](Adapter.md) object and returns a new [Adapter](Adapter.md) object with the following state change functions added:
- `set`: A reaction that sets the state to the payload
- `reset`: A reaction that sets the state to the initial state

Every adapter also comes with a default selector:

- `state` returns the top-level state value

#### Example: Empty initial adapter object

```typescript
import { createAdapter } from '@state-adapt/core';

const numberAdapter = createAdapter<number>()({});
```

#### Example: Small initial adapter object

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

#### Example: Initial adapter object with complex state

```typescript
import { createAdapter } from '@state-adapt/core';

interface ComplexState {
  count: number;
  name: string;
}

const complexAdapter = createAdapter<ComplexState>()({
  increment: state => ({ ...state, count: state.count + 1 }),
  decrement: state => ({ ...state, count: state.count - 1 }),
  setName: (state, name: string) => ({ ...state, name }),
  selectors: {
    negative: state => state.count * -1,
  },
});
```

## Type Parameters

### State

`State`

## Returns

> \<`S`, `R`\>(`adapter`): `InitializedAdapter`\<`State`, `S`, `R`\>

### Type Parameters

#### S

`S` *extends* `Selectors`\<`State`\>

#### R

`R` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

### Parameters

#### adapter

[`Adapter`](Adapter.md)\<`State`, `S`, `R`\>

### Returns

`InitializedAdapter`\<`State`, `S`, `R`\>
