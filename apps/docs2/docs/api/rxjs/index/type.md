---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/sources/type.operator.ts#L19
---

# Function: type()

> **type**(`type`): \<`T`\>(`source$`) => `T` & `object`

Defined in: [libs/rxjs/src/lib/sources/type.operator.ts:19](https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/sources/type.operator.ts#L19)

`type` is a custom RxJS [operator](https://rxjs.dev/guide/operators) that mutates an RxJS [Observable](https://rxjs.dev/guide/observable)
by setting a `type` property. It takes one argument, which will appear as the action type in Redux DevTools:

![Action Type in Redux Devtools](https://state-adapt.github.io/assets/devtools-timer$.png)

#### Example: Converting an observable into a source

```typescript
import { timer } from 'rxjs';
import { type } from '@state-adapt/rxjs';

const timer$ = timer(1000).pipe(type('timer$'));

timer$.subscribe(console.log);
// 0
```

## Parameters

### type

`string`

## Returns

> \<`T`\>(`source$`): `T` & `object`

### Type Parameters

#### T

`T`

### Parameters

#### source$

`T`

### Returns

`T` & `object`
