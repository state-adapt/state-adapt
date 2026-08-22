---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/watch.function.ts#L28
---

# Function: watch()

> **watch**\<`State`, `S`, `R`\>(`path`, `adapter?`): `ReactWatch`\<`State`, `S`\>

Defined in: [lib/watch.function.ts:28](https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/watch.function.ts#L28)

See [StateAdapt.watch](../../rxjs/index/StateAdapt.md#watch) for the complete API.

This wrapper additionally lets you call the store as a function for its
current state, or call a selector property for its current result.

```ts
const name = watch('name', stringAdapter);

// While the store at "name" is active:
console.log(name()); // 'John'
console.log(name.uppercase()); // 'JOHN'
```

Reads are `undefined` while the store is inactive and do not activate its
sources. See [derive](derive.md) for composing these reads.

## Type Parameters

### State

`State` = `any`

### S

`S` *extends* `Selectors`\<`State`\> = \{ \}

### R

`R` *extends* `ReactionsWithSelectors`\<`State`, `S`\> = \{ \}

## Parameters

### path

`string`

### adapter?

[`Adapter`](../../core/src/Adapter.md)\<`State`, `S`, `R` & `BasicAdapterMethods`\<`State`\>\>

## Returns

`ReactWatch`\<`State`, `S`\>
