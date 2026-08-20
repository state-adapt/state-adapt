---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/create-entity-adapter.function.ts#L93
---

# Function: createEntityState()

> **createEntityState**\<`Entity`, `Id`, `State`\>(`state`): [`EntityState`](EntityState.md)\<`Entity`, `Id`\>

Defined in: [adapters/src/lib/create-entity-adapter.function.ts:93](https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/create-entity-adapter.function.ts#L93)

Creates empty normalized entity state while preserving any extra state fields.

## Type Parameters

### Entity

`Entity`

### Id

`Id` *extends* `string` \| `number` \| `symbol` = `DefaultId`\<`Entity`\>

### State

`State` *extends* [`EntityState`](EntityState.md)\<`Entity`, `Id`\> = [`EntityState`](EntityState.md)\<`Entity`, `Id`\>

## Parameters

### state

`Partial`\<`State`\> = `{}`

Optional initial fields, IDs, or entities.

## Returns

[`EntityState`](EntityState.md)\<`Entity`, `Id`\>

Entity state with `ids` and `entities` initialized.

#### Example

```typescript
import { createEntityState } from '@state-adapt/core/adapters';

type Todo = { id: string; text: string };

const initialState = createEntityState<Todo>();
// { ids: [], entities: {} }
```
