# Function: catchErrorSource()

> **catchErrorSource**\<`Payload`, `TypePrefix`\>(`typePrefix`): (`source$`) => `Observable`\<`Payload` \| [`Action`](../../core/src/Action.md)\<`any`, `` `${TypePrefix}.error$` ``\>\>

Defined in: [libs/rxjs/src/lib/sources/catch-error-source.operator.ts:24](https://github.com/state-adapt/state-adapt/blob/4ff8540684d6d76a52452612f8fa44ffd7c6016a/libs/rxjs/src/lib/sources/catch-error-source.operator.ts#L24)

`catchErrorSource` is a custom RxJS [operator](https://rxjs.dev/guide/operators) that converts an RxJS [Observable](https://rxjs.dev/guide/observable)
of any values into a source of errors, using RxJS' [catchError](https://rxjs.dev/api/operators/catchError) operator.
It takes one argument, [TypePrefix](#catcherrorsourcetypeprefix), and prefixes it to create an object of type [Action](../../core/src/Action.md)<any, ${[TypePrefix](#catcherrorsourcetypeprefix)}.error$>.

#### Example: Catching errors from a source

```typescript
import { timer, map } from 'rxjs';

const timer$ = timer(1000).pipe(
  map(n => ({ type: 'timer$', payload: n.fakeNumberMethod() })),
  catchErrorSource('timer'),
);

timer$.subscribe(console.log);
// { type: 'timer.error$', payload: 'Error: n.fakeNumberMethod is not a function' }
```

## Type Parameters

### Payload

`Payload`

### TypePrefix

`TypePrefix` *extends* `string`

## Parameters

### typePrefix

`TypePrefix`

## Returns

> (`source$`): `Observable`\<`Payload` \| [`Action`](../../core/src/Action.md)\<`any`, `` `${TypePrefix}.error$` ``\>\>

### Parameters

#### source$

`Observable`\<`Payload`\>

### Returns

`Observable`\<`Payload` \| [`Action`](../../core/src/Action.md)\<`any`, `` `${TypePrefix}.error$` ``\>\>
