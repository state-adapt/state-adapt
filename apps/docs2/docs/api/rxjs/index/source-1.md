---
definedIn: https://github.com/state-adapt/state-adapt/blob/4e457fa33331f265d75eaddb646761782498dd8e/libs/rxjs/src/lib/sources/source.function.ts#L44
---

# Function: source()

> **source**\<`T`\>(`type`): `SourceFn`\<`T`\>

Defined in: [libs/rxjs/src/lib/sources/source.function.ts:44](https://github.com/state-adapt/state-adapt/blob/4e457fa33331f265d75eaddb646761782498dd8e/libs/rxjs/src/lib/sources/source.function.ts#L44)

`source` returns an object that extends an RxJS [Subject](https://rxjs.dev/guide/subject) with an extra `type: string` property, and is also callable directly.
 When using a `source`, you can provide a `type` argument, which will appear as the action type in Redux DevTools:

 ![Action Type in Redux Devtools](https://state-adapt.github.io/assets/devtools-add$.png)

 In the future we want to add a build step to add this annotation automatically. That is why source types are optional.

 #### Example: Creating a source without a type

 ```typescript
 import { source } from '@state-adapt/rxjs';

 const add$ = source<number>();

 add$.subscribe(console.log);

 add$.next(1);
 // 1

 add$(2)
 // 2
 ```

 #### Example: Creating a source with a type
 ```typescript
 const add$ = source<number>('add$');
 ```

 #### Example: Creating a source with onEvent naming convention
 ```typescript
 import { source } from '@state-adapt/rxjs';

 const onAdd = source<number>();

 onAdd.subscribe(console.log);

 onAdd(1)
 // 1
 ```

## Type Parameters

### T

`T`

## Parameters

### type

`string` = `''`

## Returns

`SourceFn`\<`T`\>
