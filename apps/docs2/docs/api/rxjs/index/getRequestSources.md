# Function: getRequestSources()

> **getRequestSources**\<`TypePrefix`, `Payload`\>(`typePrefix`, `obs$`): `object`

Defined in: [libs/rxjs/src/lib/sources/get-request-sources.function.ts:67](https://github.com/state-adapt/state-adapt/blob/4ff8540684d6d76a52452612f8fa44ffd7c6016a/libs/rxjs/src/lib/sources/get-request-sources.function.ts#L67)

`getRequestSources` takes in a [TypePrefix](#getrequestsourcestypeprefix) and an [Observable](https://rxjs.dev/guide/observable)
of values of type [Payload](#getrequestsourcespayload) (inferred) and returns an object with `success$` and `error$` propeties.

The `success$` property is an observable of values of type

```ts
{ type: `${TypePrefix}.success$`; payload: Payload }
```

The `error$` property is an observable of values of type

```ts
{ type: `${TypePrefix}.error$`; payload: any }
```

`getRequestSources` combines the functionality of [toRequestSource](toRequestSource.md) and [splitRequestSources](splitRequestSources.md).

Important: RxJS streams complete immediately after they error. For simple HTTP requests, this is fine.
But if you need to keep a stream alive, look into using [toRequestSource](toRequestSource.md) and [splitRequestSources](splitRequestSources.md)
directly.

#### Example: Split an HTTP source into success$ and error$ sources

```typescript
import { ajax } from 'rxjs/ajax';
import { getRequestSources } from '@state-adapt/rxjs';

const http$ = ajax('https://jsonplaceholder.typicode.com/todos/1');

const todoRequest = getRequestSources('todo', http$);

todoRequest.success$.subscribe(console.log);
// { type: 'todo.success$', payload: { ... } }

todoRequest.error$.subscribe(console.log);
// { type: 'todo.error$', payload: { ... } }
```

#### Example: Convert any observable into success$ and error$ sources

```typescript
import { interval, map } from 'rxjs';
import { getRequestSources } from '@state-adapt/rxjs';

const interval$ = interval(1000).pipe(
  map(n => n !== 2 ? n : (n as any).fakeNumberMethod()),
);

const { success$, error$ } = getRequestSources('interval', interval$);

success$.subscribe(console.log);
// { type: 'interval.success$', payload: 0 }
// { type: 'interval.success$', payload: 1 }
// Will not log anymore, after error

error$.subscribe(console.log);
// { type: 'interval.error$', payload: 'Error: n.fakeNumberMethod is not a function' }
```

## Type Parameters

### TypePrefix

`TypePrefix` *extends* `string`

### Payload

`Payload`

## Parameters

### typePrefix

`TypePrefix`

### obs$

`Observable`\<`Payload`\>

## Returns

`object`

### error$

> **error$**: `Observable`\<[`Action`](../../core/src/Action.md)\<`any`, `` `${TypePrefix}.error$` ``\>\>

### success$

> **success$**: `Observable`\<[`Action`](../../core/src/Action.md)\<`Payload`, `` `${TypePrefix}.success$` ``\>\>
