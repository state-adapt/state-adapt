---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L41
---

# Interface: MethodApiDefinition

Defined in: [lib/recognizers/types.ts:41](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L41)

Recognizes commands called as methods, such as `cache.write()`.

## Extends

- `ApiDefinitionBase`

## Properties

### argumentIndex?

> `optional` **argumentIndex**: `number`

Defined in: [lib/recognizers/types.ts:53](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L53)

Zero-based argument used when `resource` is `argument`.

***

### importSources?

> `optional` **importSources**: `string`[]

Defined in: [lib/recognizers/types.ts:49](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L49)

Optional module specifiers that restrict the match.

***

### methods

> **methods**: `string`[]

Defined in: [lib/recognizers/types.ts:43](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L43)

Method names to recognize, such as `write` in `cache.write()`.

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

### receiverNames?

> `optional` **receiverNames**: `string`[]

Defined in: [lib/recognizers/types.ts:47](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L47)

Optional receiver names that restrict the match.

***

### resource?

> `optional` **resource**: `"receiver"` \| `"argument"`

Defined in: [lib/recognizers/types.ts:51](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L51)

The receiver or selected argument whose declaration determines distance.
