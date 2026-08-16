---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/global-store/state-adapt.types.ts#L32
---

# Type Alias: InitialState\<State\>

> **InitialState**\<`State`\> = `State` \| () => `State`

Defined in: [libs/rxjs/src/lib/global-store/state-adapt.types.ts:32](https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/global-store/state-adapt.types.ts#L32)

A store's initial state, either as a plain value or as a factory function that returns it.

A factory runs once per activation: the store calls it when it activates, holds onto that
value for as long as it stays active, and discards it when it deactivates. So a store that
is reset always goes back to what its *current* activation started from.
Reading state from an inactive store calls the factory for that read alone.

```typescript
const name = adapt(() => localStorage.getItem('name') ?? 'John');
```

## Type Parameters

### State

`State`
