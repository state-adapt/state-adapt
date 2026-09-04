---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L57
---

# Interface: FunctionApiDefinition

Defined in: [lib/recognizers/types.ts:57](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L57)

Recognizes standalone command functions, such as `writeCache(cache)`.

## Extends

- `ApiDefinitionBase`

## Properties

### argumentIndex?

> `optional` **argumentIndex**: `number`

Defined in: [lib/recognizers/types.ts:67](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L67)

Zero-based argument used when `resource` is `argument`.

***

### functions

> **functions**: `string`[]

Defined in: [lib/recognizers/types.ts:59](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L59)

Function names to recognize, such as `writeCache`.

***

### importSources?

> `optional` **importSources**: `string`[]

Defined in: [lib/recognizers/types.ts:63](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L63)

Optional module specifiers that restrict the match.

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

***

### resource?

> `optional` **resource**: `"argument"` \| `"callee"`

Defined in: [lib/recognizers/types.ts:65](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L65)

The selected argument or imported callee whose declaration determines distance.
