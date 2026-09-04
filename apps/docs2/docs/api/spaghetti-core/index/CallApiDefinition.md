---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L71
---

# Interface: CallApiDefinition

Defined in: [lib/recognizers/types.ts:71](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L71)

Recognizes an API by its exact source-level call name.

## Extends

- `ApiDefinitionBase`

## Properties

### calls

> **calls**: `string`[]

Defined in: [lib/recognizers/types.ts:73](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L73)

Exact source-level call names, such as `console.log`.

***

### name

> **name**: `string`

Defined in: [lib/recognizers/types.ts:32](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L32)

Stable name used to identify the API.

#### Inherited from

`ApiDefinitionBase.name`

***

### penalty?

> `optional` **penalty**: `number`

Defined in: [lib/recognizers/types.ts:37](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L37)

Sets the command leaf's starting penalty. Distance costs remain additive.
Zero discards the command immediately; omit this to use ordinary scoring.

#### Inherited from

`ApiDefinitionBase.penalty`
