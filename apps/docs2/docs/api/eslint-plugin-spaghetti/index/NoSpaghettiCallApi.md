---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L48
---

# Interface: NoSpaghettiCallApi

Defined in: [lib/no-spaghetti-options.ts:48](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L48)

Recognizes an API by its exact source-level call name.

## Extends

- `NoSpaghettiApiBase`

## Properties

### calls

> **calls**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:50](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L50)

Exact source-level call names, such as `console.log`.

***

### name

> **name**: `string`

Defined in: [lib/no-spaghetti-options.ts:3](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L3)

Stable name used to identify the API.

#### Inherited from

`NoSpaghettiApiBase.name`

***

### penalty?

> `optional` **penalty**: `number`

Defined in: [lib/no-spaghetti-options.ts:8](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L8)

Sets the command leaf's starting penalty. Distance costs remain additive.
Zero discards the command immediately; omit this to use ordinary scoring.

#### Inherited from

`NoSpaghettiApiBase.penalty`
