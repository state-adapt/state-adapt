---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/adapt.function.ts#L26
---

# Function: adapt()

> **adapt**\<`State`, `S`, `R`, `R2`, `ReturnedSources`\>(`initialState`, `second`): `ReactStore`\<`State`, `S`, `object` *extends* `R` ? `R2` : `R`\>

Defined in: [lib/adapt.function.ts:26](https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/adapt.function.ts#L26)

See [StateAdapt.adapt](../../rxjs/index/StateAdapt.md#adapt) for the complete API.

This wrapper additionally lets you call the store as a function for its
current state, or call a selector property for its current result.

```ts
const name = adapt('John', stringAdapter);

console.log(name()); // 'John'
console.log(name.uppercase()); // 'JOHN'
```

See [derive](derive.md) for composing these reads.

## Type Parameters

### State

`State`

### S

`S` *extends* `Selectors`\<`State`\>

### R

`R` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

### R2

`R2` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

### ReturnedSources

`ReturnedSources` = `unknown`

## Parameters

### initialState

`InitialState`\<`State`\>

### second

`R` & `object` & `NotAdaptOptions` | `AdaptOptions`\<`State`, `S`, `R2`, `ReturnedSources`\>

## Returns

`ReactStore`\<`State`, `S`, `object` *extends* `R` ? `R2` : `R`\>
