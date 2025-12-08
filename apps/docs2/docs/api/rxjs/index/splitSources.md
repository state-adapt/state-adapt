---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/sources/split-sources.function.ts#L77
---

# Function: splitSources()

> **splitSources**\<`CommonAction`, `Aliases`\>(`source$`, `partitions?`): \{ \[K in string \| number \| symbol\]: ActionMap\<CommonAction\>\[Aliases\[K\]\] \} & `ActionMap`\<`CommonAction`\>

Defined in: [libs/rxjs/src/lib/sources/split-sources.function.ts:77](https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/sources/split-sources.function.ts#L77)

`splitSources` is a function that takes in an [Observable](https://rxjs.dev/guide/observable) that emits multiple types of [Action](../../core/src/Action.md) objects and splits it into a source for each [Action](../../core/src/Action.md) type.
It takes two arguments:
- `source$`: [Observable](https://rxjs.dev/guide/observable)<[CommonAction](#splitsourcescommonaction)>
- `aliases?`: [Aliases](#splitsourcesaliases) extends { [index: string]: CommonType } — An optional object with keys that will become the new source names,
and values that will filter against the `type` property of the actions from the `source$` observable.

It returns a proxy object that defines keys from the source types and the `aliases` argument (if provided),
and values of type [Observable](https://rxjs.dev/guide/observable)<[Action](../../core/src/Action.md)<`Payload`, `Type`>>
where `Payload` and `Type` are inferred from the filtered `CommonAction` type.

If the source type is specific (as in `'even$' | 'odd$'`), the returned object will have `'even$'` and `'odd$'` properties.
If the source type is just a string, any string can be accessed, and splitSources will filter against that string.
The proxy defines this filtered source once the property is accessed.

#### Example: Splitting a source into multiple sources

```typescript
import { getAction } from '@state-adapt/core';
import { splitSources } from '@state-adapt/rxjs';
import { interval, map } from 'rxjs';

const evenAndOdd$ = interval(1000).pipe(
  map(n => ({
    // type has to be 'even$' | 'odd$', not just a string
    type: n % 2 === 0 ? ('even$' as const) : ('odd$' as const),
    payload: n,
  })),
);

evenAndOdd$.subscribe(console.log);
// { type: 'even$', payload: 0 }
// { type: 'odd$', payload: 1 }
// { type: 'even$', payload: 2 }
// { type: 'odd$', payload: 3 }

const { even$, odd$ } = splitSources(evenAndOdd$);

even$.subscribe(console.log);
// { type: 'even$', payload: 0 }
// { type: 'even$', payload: 2 }

odd$.subscribe(console.log);
// { type: 'odd$', payload: 1 }
// { type: 'odd$', payload: 3 }
```

#### Example: Splitting an HTTP source using aliases

```typescript
import { getAction } from '@state-adapt/core';
import { toSource, splitSources } from '@state-adapt/rxjs';
import { ajax } from 'rxjs/ajax';

const http$ = ajax('https://jsonplaceholder.typicode.com/todos/1').pipe(
  map(res => ({ type: 'todos.success$' as const, payload: res })),
  catchError(error => of({ type: 'todos.error$' as const, payload: error })),
);

const { success$, error$ } = splitSources(http$, {
  success$: 'todos.success$',
  error$: 'todos.error$',
});

success$.subscribe(console.log);
// { type: 'success$', payload: { ... } }

error$.subscribe(console.log);
// { type: 'error$', payload: { ... } }
```

## Type Parameters

### CommonAction

`CommonAction` *extends* `object`

### Aliases

`Aliases` *extends* `object`

## Parameters

### source$

`Observable`\<`CommonAction`\>

### partitions?

`Aliases`

## Returns

\{ \[K in string \| number \| symbol\]: ActionMap\<CommonAction\>\[Aliases\[K\]\] \} & `ActionMap`\<`CommonAction`\>
