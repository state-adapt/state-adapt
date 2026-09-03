---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L60
---

# Interface: NoSpaghettiRecognizedApi

Defined in: [lib/no-spaghetti-options.ts:60](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L60)

Assigns a penalty to an API recognized by a built-in recognizer.

## Extends

- `NoSpaghettiApiBase`

## Properties

### name

> **name**: `string`

Defined in: [lib/no-spaghetti-options.ts:3](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L3)

Stable name used to identify the API.

#### Inherited from

`NoSpaghettiApiBase.name`

***

### penalty

> **penalty**: `number`

Defined in: [lib/no-spaghetti-options.ts:65](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L65)

Sets the command leaf's starting penalty. Distance costs remain additive.
Zero discards the command immediately.

#### Overrides

`NoSpaghettiApiBase.penalty`
