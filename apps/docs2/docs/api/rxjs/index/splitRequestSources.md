---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/sources/split-request-sources.function.ts#L89
---

# Function: splitRequestSources()

> **splitRequestSources**\<`TypePrefix`, `A`\>(`typePrefix`, `obs$`): `object`

Defined in: [libs/rxjs/src/lib/sources/split-request-sources.function.ts:89](https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/sources/split-request-sources.function.ts#L89)

`splitRequestSources` is a function that takes in a [TypePrefix](#splitrequestsourcestypeprefix) and an [Observable](https://rxjs.dev/guide/observable) with values of type

```ts
| { type: `${TypePrefix}.success$`; payload: Payload }
| { type: `${TypePrefix}.error$`; payload: any }
```

and returns an object with `success$` and `error$` propeties.

The `success$` property is an observable of values of type

```ts
{ type: `${TypePrefix}.success$`; payload: Payload }
```

The `error$` property is an observable of values of type

```ts
{ type: `${TypePrefix}.error$`; payload: any }
```

#### Example: Convert an HTTP POST observable into success$ and error$ sources

```typescript
import { exhaustMap } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { splitRequestSources,  toRequestSource } from '@state-adapt/rxjs';

const deleteTodo$ = source<number>();

const deleteTodoRequest$ = deleteTodo$.pipe(
  exhaustMap((id) =>
    ajax({
      url: `https://jsonplaceholder.typicode.com/todos/${id}`,
      method: 'DELETE',
    }).pipe(toRequestSource('todo.delete'))
  )
);
const deleteTodoRequest = splitRequestSources('todo.delete', deleteTodoRequest$);

todoRequest.success$.subscribe(console.log);
todoRequest.error$.subscribe(console.log);

deleteTodo$.next(1);
// { type: 'todo.delete.success$', payload: AjaxResponse{…} }

deleteTodo$.next(Infinity);
// { type: 'todo.delete.error$', payload: 'AjaxErrorImpl{…} }

deleteTodo$.next(2);
// { type: 'todo.delete.success$', payload: AjaxResponse{…} }
```

The main stream is not killed because `toRequestSource` operates on the request observable
instead of the outer observable.

#### Example: Splitting an observable of request actions into success$ and error$ sources

```typescript
import { interval } from 'rxjs';
import { splitRequestSources, toRequestSource } from '@state-adapt/rxjs';

const interval$ = interval(1000).pipe(
  map(n => n < 2 ? n : n.fakeNumberMethod()),
  toRequestSource('interval'),
);

const { success$, error$ } = splitRequestSources('interval', interval$);

success$.subscribe(console.log);
// { type: 'interval.success$', payload: 0 }
// { type: 'interval.success$', payload: 1 }
// End

error$.subscribe(console.log);
// { type: 'interval.error$', payload: 'Error: n.fakeNumberMethod is not a function' }
```

The main stream is killed because `toRequestSource` operates directly on it
instead of on an inner observable.

## Type Parameters

### TypePrefix

`TypePrefix` *extends* `string`

### A

`A` *extends* [`Action`](../../core/src/Action.md)\<`any`, `` `${TypePrefix}.success$` `` \| `` `${TypePrefix}.error$` ``\>

## Parameters

### typePrefix

`TypePrefix`

### obs$

`Observable`\<`A`\>

## Returns

`object`

### error$

> **error$**: `Observable`\<[`Action`](../../core/src/Action.md)\<`any`, `` `${TypePrefix}.error$` ``\>\>

### success$

> **success$**: `Observable`\<`A` *extends* [`Action`](../../core/src/Action.md)\<`Payload`, `` `${TypePrefix}.success$` ``\> ? [`Action`](../../core/src/Action.md)\<`Payload`, `` `${TypePrefix}.success$` ``\> : `never`\>
