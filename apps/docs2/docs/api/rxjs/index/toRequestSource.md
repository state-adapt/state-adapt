# Function: toRequestSource()

> **toRequestSource**\<`Payload`, `TypePrefix`\>(`typePrefix`): (`source$`) => `Observable`\<[`Action`](../../core/src/Action.md)\<`Payload`, `` `${TypePrefix}.success$` ``\> \| [`Action`](../../core/src/Action.md)\<`any`, `` `${TypePrefix}.error$` ``\>\>

Defined in: [libs/rxjs/src/lib/sources/to-request-source.operator.ts:70](https://github.com/state-adapt/state-adapt/blob/4ff8540684d6d76a52452612f8fa44ffd7c6016a/libs/rxjs/src/lib/sources/to-request-source.operator.ts#L70)

`toRequestSource` takes in a [TypePrefix](#torequestsourcetypeprefix) and converts an RxJS [Observable](https://rxjs.dev/guide/observable)
of values of type [Payload](#torequestsourcepayload) (inferred) into an [Observable](https://rxjs.dev/guide/observable) of values of type

```ts
| { type: `${TypePrefix}.success$`; payload: Payload }
| { type: `${TypePrefix}.error$`; payload: any }
```

#### Example: Convert an HTTP POST observable into an observable with `success$` and `error$` values

```typescript
import { exhaustMap } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { toRequestSource } from '@state-adapt/rxjs';

const deleteTodo$ = source<number>();

const deleteTodoRequest$ = deleteTodo$.pipe(
  exhaustMap((id) =>
    ajax({
      url: `https://jsonplaceholder.typicode.com/todos/${id}`,
      method: 'DELETE',
    }).pipe(toRequestSource('todo.delete'))
  )
);

deleteTodoRequest$.subscribe(console.log);

deleteTodo$.next(1);
// { type: 'todo.delete.success$', payload: AjaxResponse{…} }

deleteTodo$.next(Infinity);
// { type: 'todo.delete.error$', payload: 'AjaxErrorImpl{…} }

deleteTodo$.next(2);
// { type: 'todo.delete.success$', payload: AjaxResponse{…} }
```

The main stream is not killed because `toRequestSource` operates on the request observable
instead of the outer observable.

#### Example: Converting any observable into a request source

```typescript
import { interval } from 'rxjs';
import { toRequestSource } from '@state-adapt/rxjs';

const interval$ = interval(1000).pipe(
  map(n => n < 2 ? n : n.fakeNumberMethod()),
  toRequestSource('interval'),
);

interval$.subscribe(console.log);
// { type: 'interval.success$', payload: 0 }
// { type: 'interval.success$', payload: 1 }
// { type: 'interval.error$', payload: 'Error: n.fakeNumberMethod is not a function' }
// End
```

The main stream is killed because `toRequestSource` operates directly on it
instead of on an inner observable.

## Type Parameters

### Payload

`Payload`

### TypePrefix

`TypePrefix` *extends* `string`

## Parameters

### typePrefix

`TypePrefix`

## Returns

> (`source$`): `Observable`\<[`Action`](../../core/src/Action.md)\<`Payload`, `` `${TypePrefix}.success$` ``\> \| [`Action`](../../core/src/Action.md)\<`any`, `` `${TypePrefix}.error$` ``\>\>

### Parameters

#### source$

`Observable`\<`Payload`\>

### Returns

`Observable`\<[`Action`](../../core/src/Action.md)\<`Payload`, `` `${TypePrefix}.success$` ``\> \| [`Action`](../../core/src/Action.md)\<`any`, `` `${TypePrefix}.error$` ``\>\>
