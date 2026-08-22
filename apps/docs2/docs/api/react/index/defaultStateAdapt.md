---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/default-state-adapt.const.ts#L7
---

# Variable: defaultStateAdapt

> `const` **defaultStateAdapt**: `object`

Defined in: [lib/default-state-adapt.const.ts:7](https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/default-state-adapt.const.ts#L7)

The StateAdapt instance used by the React integration when no custom
`AdaptContext.Provider` is present.

## Type declaration

### adapt()

> **adapt**: \<`State`, `S`, `R`, `R2`, `ReturnedSources`\>(`initialState`, `second?`) => `ReactStore`\<`State`, `S`, `object` *extends* `R` ? `R2` : `R`\>

Creates a store using this StateAdapt instance.

#### Type Parameters

##### State

`State`

##### S

`S` *extends* `Selectors`\<`State`\>

##### R

`R` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

##### R2

`R2` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

##### ReturnedSources

`ReturnedSources` = `unknown`

#### Parameters

##### initialState

`InitialState`\<`State`\>

##### second?

`R` & `object` & `NotAdaptOptions` | `AdaptOptions`\<`State`, `S`, `R2`, `ReturnedSources`\>

#### Returns

`ReactStore`\<`State`, `S`, `object` *extends* `R` ? `R2` : `R`\>

### watch()

> **watch**: \<`State`, `S`, `R`\>(`path`, `adapter?`) => `ReactWatch`\<`State`, `S`\>

Watches a store path using this StateAdapt instance.

#### Type Parameters

##### State

`State` = `any`

##### S

`S` *extends* `Selectors`\<`State`\> = \{ \}

##### R

`R` *extends* `ReactionsWithSelectors`\<`State`, `S`\> = \{ \}

#### Parameters

##### path

`string`

##### adapter?

[`Adapter`](../../core/src/Adapter.md)\<`State`, `S`, `R` & `BasicAdapterMethods`\<`State`\>\>

#### Returns

`ReactWatch`\<`State`, `S`\>
