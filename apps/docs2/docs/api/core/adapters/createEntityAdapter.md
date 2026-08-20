---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/create-entity-adapter.function.ts#L309
---

# Function: createEntityAdapter()

> **createEntityAdapter**\<`Entity`, `Id`, `State`\>(): \<`S`, `R`, `Filters`, `Sorters`\>(`adapter`, `options?`) => `object` & `BasicAdapterMethods`\<`State`\> & \{ \[K in string as K extends "selectors" \| "set" ? never : PrefixedAfterVerb\<Exclude\<K, "set" \| "reset"\>, "all" \| Filters\[number\]\>\]: R\[K\] extends (state: any, payload: any, initialState: any) =\> any ? (state: State, payload: Parameters\<any\[any\]\>\[1\] extends void ? void : Parameters\<any\[any\]\>\[1\], initialState: State) =\> State : never \} & \{ \[K in string as K extends "selectors" \| "set" ? never : PrefixedAfterVerb\<K, "one"\>\]: R\[K\] extends (state: any, payload: any, initialState: any) =\> any ? (state: State, payload: Parameters\<any\[any\]\>\[1\] extends void ? Extract\<Entity\[Id\], Index\> : \[Extract\<Entity\[Id\], Index\>, Parameters\<any\[any\]\>\[1\]\], initialState: State) =\> State : never \} & \{ \[K in string as K extends "selectors" \| "set" ? never : PrefixedAfterVerb\<K, "many"\>\]: R\[K\] extends (state: any, payload: any, initialState: any) =\> any ? (state: State, payload: Parameters\<any\[any\]\>\[1\] extends void ? Extract\<Entity\[Id\], Index\>\[\] : \[Extract\<Entity\[Id\], Index\>, Parameters\<any\[any\]\>\[1\]\]\[\], initialState: State) =\> State : never \} & `object`

Defined in: [adapters/src/lib/create-entity-adapter.function.ts:309](https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/create-entity-adapter.function.ts#L309)

Creates an adapter for normalized entity state from an adapter for one entity.

The result includes collection reactions such as `addOne`, `setAll`, and
`removeMany`. Reactions from the entity adapter are expanded for one, many,
all, and any configured filters. Entity selectors can also become filters or
sorters for the collection.

Entities use their `id` field by default. For another ID field, pass its key
as the second type argument and add an `id` selector to the entity adapter.

#### Example: Filters and sorting

```typescript
import { createAdapter } from '@state-adapt/core';
import {
  createEntityAdapter,
  createEntityState,
  EntityState,
} from '@state-adapt/core/adapters';

interface Todo {
  todoId: string;
  title: string;
  priority: number;
  done: boolean;
}

const todoAdapter = createAdapter<Todo>()({
  toggleDone: todo => ({ ...todo, done: !todo.done }),
  selectors: {
    id: todo => todo.todoId,
    done: todo => todo.done,
    priority: todo => todo.priority,
  },
});

const createTodosAdapter = createEntityAdapter<Todo, 'todoId'>();

export const todosAdapter = createTodosAdapter(todoAdapter, {
  filters: ['done'],
  sorters: ['priority'],
});

type TodosState = EntityState<Todo, 'todoId'>;

export const initialTodosState: TodosState = todosAdapter.setAll(
  createEntityState<Todo, 'todoId'>(),
  [
    { todoId: 'tests', title: 'Write tests', priority: 2, done: true },
    { todoId: 'docs', title: 'Write docs', priority: 1, done: false },
  ],
);
```

#### Usage with React

```tsx
import { adapt, useStore } from '@state-adapt/react';
import { initialTodosState, todosAdapter } from './todos.adapter';

const todosStore = adapt(initialTodosState, todosAdapter);

export function CompletedTodos() {
  const [todos, actions] = useStore(todosStore);

  return (
    <ul>
      {todos.doneByPriority.map(todo => (
        <li key={todo.todoId}>
          <button onClick={() => actions.toggleOneDone(todo.todoId)}>
            {todo.title}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

#### Usage with Angular

```typescript
import { Component } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { initialTodosState, todosAdapter } from './todos.adapter';

@Component({
  standalone: true,
  selector: 'app-completed-todos',
  template: `
    <ul>
      @for (todo of todos.doneByPriority(); track todo.todoId) {
        <li>
          <button (click)="todos.toggleOneDone(todo.todoId)">
            {{ todo.title }}
          </button>
        </li>
      }
    </ul>
  `,
})
export class CompletedTodosComponent {
  todos = adapt(initialTodosState, todosAdapter);
}
```

#### Running examples

- [Angular on StackBlitz](https://stackblitz.com/github/state-adapt/state-adapt?preset=node&startScript=demo:angular&file=apps%2Fangular-demo%2Fsrc%2Fapp%2Fcrew%2Fcrew.adapter.ts)
- [React on StackBlitz](https://stackblitz.com/github/state-adapt/state-adapt?preset=node&startScript=demo:react&file=apps%2Freact-demo%2Fsrc%2Fapp%2Fcrew%2Fcrew.adapter.ts)

## Type Parameters

### Entity

`Entity`

### Id

`Id` *extends* `string` \| `number` \| `symbol` = `DefaultId`\<`Entity`\>

### State

`State` *extends* [`EntityState`](EntityState.md)\<`Entity`, `Id`\> = [`EntityState`](EntityState.md)\<`Entity`, `Id`\>

## Returns

> \<`S`, `R`, `Filters`, `Sorters`\>(`adapter`, `options?`): `object` & `BasicAdapterMethods`\<`State`\> & \{ \[K in string as K extends "selectors" \| "set" ? never : PrefixedAfterVerb\<Exclude\<K, "set" \| "reset"\>, "all" \| Filters\[number\]\>\]: R\[K\] extends (state: any, payload: any, initialState: any) =\> any ? (state: State, payload: Parameters\<any\[any\]\>\[1\] extends void ? void : Parameters\<any\[any\]\>\[1\], initialState: State) =\> State : never \} & \{ \[K in string as K extends "selectors" \| "set" ? never : PrefixedAfterVerb\<K, "one"\>\]: R\[K\] extends (state: any, payload: any, initialState: any) =\> any ? (state: State, payload: Parameters\<any\[any\]\>\[1\] extends void ? Extract\<Entity\[Id\], Index\> : \[Extract\<Entity\[Id\], Index\>, Parameters\<any\[any\]\>\[1\]\], initialState: State) =\> State : never \} & \{ \[K in string as K extends "selectors" \| "set" ? never : PrefixedAfterVerb\<K, "many"\>\]: R\[K\] extends (state: any, payload: any, initialState: any) =\> any ? (state: State, payload: Parameters\<any\[any\]\>\[1\] extends void ? Extract\<Entity\[Id\], Index\>\[\] : \[Extract\<Entity\[Id\], Index\>, Parameters\<any\[any\]\>\[1\]\]\[\], initialState: State) =\> State : never \} & `object`

### Type Parameters

#### S

`S` *extends* `Selectors`\<`Entity`\>

#### R

`R` *extends* `ReactionsWithSelectors`\<`Entity`, `S`\>

#### Filters

`Filters` *extends* `Extract`\<keyof `S`, `string`\>[] = `never`[]

#### Sorters

`Sorters` *extends* `Extract`\<keyof `S`, `string`\>[] = `never`[]

### Parameters

#### adapter

[`Adapter`](../src/Adapter.md)\<`Entity`, `S`, `R`\>

#### options?

##### filters?

`Filters`

##### sorters?

`Sorters`

##### useCache?

`boolean`

### Returns

`object` & `BasicAdapterMethods`\<`State`\> & \{ \[K in string as K extends "selectors" \| "set" ? never : PrefixedAfterVerb\<Exclude\<K, "set" \| "reset"\>, "all" \| Filters\[number\]\>\]: R\[K\] extends (state: any, payload: any, initialState: any) =\> any ? (state: State, payload: Parameters\<any\[any\]\>\[1\] extends void ? void : Parameters\<any\[any\]\>\[1\], initialState: State) =\> State : never \} & \{ \[K in string as K extends "selectors" \| "set" ? never : PrefixedAfterVerb\<K, "one"\>\]: R\[K\] extends (state: any, payload: any, initialState: any) =\> any ? (state: State, payload: Parameters\<any\[any\]\>\[1\] extends void ? Extract\<Entity\[Id\], Index\> : \[Extract\<Entity\[Id\], Index\>, Parameters\<any\[any\]\>\[1\]\], initialState: State) =\> State : never \} & \{ \[K in string as K extends "selectors" \| "set" ? never : PrefixedAfterVerb\<K, "many"\>\]: R\[K\] extends (state: any, payload: any, initialState: any) =\> any ? (state: State, payload: Parameters\<any\[any\]\>\[1\] extends void ? Extract\<Entity\[Id\], Index\>\[\] : \[Extract\<Entity\[Id\], Index\>, Parameters\<any\[any\]\>\[1\]\]\[\], initialState: State) =\> State : never \} & `object`
