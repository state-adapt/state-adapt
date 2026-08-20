---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/create-entity-adapter.function.ts#L54
---

# Interface: EntityState\<Entity, Id\>

Defined in: [adapters/src/lib/create-entity-adapter.function.ts:54](https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/create-entity-adapter.function.ts#L54)

Normalized state for a collection of entities.

`ids` keeps the collection order. `entities` stores each entity by ID.

#### Example

```typescript
import { EntityState } from '@state-adapt/core/adapters';

type Todo = { id: string; text: string };

const todos: EntityState<Todo> = {
  ids: ['learn'],
  entities: { learn: { id: 'learn', text: 'Learn StateAdapt' } },
};
```

## Type Parameters

### Entity

`Entity`

### Id

`Id` *extends* `IndexableWithId`\<`Entity`\> = `DefaultId`\<`Entity`\>
