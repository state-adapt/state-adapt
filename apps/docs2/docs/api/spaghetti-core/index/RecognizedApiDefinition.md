---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L83
---

# Interface: RecognizedApiDefinition

Defined in: [lib/recognizers/types.ts:83](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L83)

Assigns a penalty to an API recognized by a built-in recognizer.

## Extends

- `ApiDefinitionBase`

## Properties

### name

> **name**: `string`

Defined in: [lib/recognizers/types.ts:32](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L32)

Stable name used to identify the API.

#### Inherited from

`ApiDefinitionBase.name`

***

### penalty

> **penalty**: `number`

Defined in: [lib/recognizers/types.ts:84](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L84)

Sets the command leaf's starting penalty. Distance costs remain additive.
Zero discards the command immediately; omit this to use ordinary scoring.

#### Overrides

`ApiDefinitionBase.penalty`
