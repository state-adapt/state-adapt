---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L34
---

# Interface: NoSpaghettiFunctionApi

Defined in: [lib/no-spaghetti-options.ts:34](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L34)

Use this definition for standalone command functions, such as `writeCache(cache)`.
One of the function arguments is treated as the affected resource.

## Extends

- `NoSpaghettiApiBase`

## Properties

### argumentIndex?

> `optional` **argumentIndex**: `number`

Defined in: [lib/no-spaghetti-options.ts:44](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L44)

Selects the argument used to calculate the command score. `0` means the first argument.

---

### functions

> **functions**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:36](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L36)

Lists command function names, such as `writeCache` in `writeCache(cache)`.

---

### importSources?

> `optional` **importSources**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:40](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L40)

Restricts recognition to APIs imported from these module specifiers.

---

### name

> **name**: `string`

Defined in: [lib/no-spaghetti-options.ts:3](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L3)

Stable name used to identify the API.

#### Inherited from

`NoSpaghettiApiBase.name`

---

### penalty?

> `optional` **penalty**: `number`

Defined in: [lib/no-spaghetti-options.ts:8](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L8)

Sets the command leaf's starting penalty. Distance costs remain additive.
Zero discards the command immediately; omit this to use ordinary scoring.

#### Inherited from

`NoSpaghettiApiBase.penalty`

---

### resource?

> `optional` **resource**: `"argument"` \| `"callee"`

Defined in: [lib/no-spaghetti-options.ts:42](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L42)

Uses the selected argument or imported callee to calculate the command score.
