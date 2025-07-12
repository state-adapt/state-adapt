---
definedIn: https://github.com/state-adapt/state-adapt/blob/4e457fa33331f265d75eaddb646761782498dd8e/libs/rxjs/src/lib/sources/to-source.operator.ts#L25
---

# Function: toSource()

> **toSource**\<`Payload`, `Type`\>(`type`): (`source$`) => `Observable`\<[`Action`](../../core/src/Action.md)\<`Payload`, `Type`\>\>

Defined in: [libs/rxjs/src/lib/sources/to-source.operator.ts:25](https://github.com/state-adapt/state-adapt/blob/4e457fa33331f265d75eaddb646761782498dd8e/libs/rxjs/src/lib/sources/to-source.operator.ts#L25)

`toSource` is a custom RxJS [operator](https://rxjs.dev/guide/operators) that converts an RxJS [Observable](https://rxjs.dev/guide/observable)
of values of type [Payload](#tosourcepayload) (inferred) into an observable of values of type [Action](../../core/src/Action.md)<[Payload](#tosourcepayload), [Type](#tosourcetype)>.
It takes one argument, `type`, which is the `type` property of the [Action](../../core/src/Action.md) objects that will be emitted, and which will
appear as the action type in Redux DevTools:

![Action Type in Redux Devtools](https://state-adapt.github.io/assets/devtools-timer$.png)

#### Example: Converting an observable into a source

```typescript
import { timer } from 'rxjs';
import { toSource } from '@state-adapt/rxjs';

const timer$ = timer(1000).pipe(toSource('timer$'));

timer$.subscribe(console.log);
// { type: 'timer$', payload: 0 }
```

## Type Parameters

### Payload

`Payload`

### Type

`Type` *extends* `string` = `""`

## Parameters

### type

`Type` = `...`

## Returns

> (`source$`): `Observable`\<[`Action`](../../core/src/Action.md)\<`Payload`, `Type`\>\>

### Parameters

#### source$

`Observable`\<`Payload`\>

### Returns

`Observable`\<[`Action`](../../core/src/Action.md)\<`Payload`, `Type`\>\>
