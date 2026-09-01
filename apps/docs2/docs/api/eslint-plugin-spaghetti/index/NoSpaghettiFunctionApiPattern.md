---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L25
---

# Interface: NoSpaghettiFunctionApiPattern

Defined in: [lib/no-spaghetti-options.ts:25](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L25)

Use this pattern for standalone command functions, such as `writeCache(cache)`.
One of the function arguments is treated as the affected resource.

## Properties

### argumentIndex?

> `optional` **argumentIndex**: `number`

Defined in: [lib/no-spaghetti-options.ts:36](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L36)

Selects the argument used to calculate the command score. `0` means the first argument.

***

### functions

> **functions**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:29](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L29)

Lists command function names, such as `writeCache` in `writeCache(cache)`.

***

### importSources?

> `optional` **importSources**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:32](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L32)

Restricts recognition to APIs imported from these module specifiers.

***

### name

> **name**: `string`

Defined in: [lib/no-spaghetti-options.ts:27](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L27)

Names the pattern so it can be referenced by `allowedApis`.

***

### resource?

> `optional` **resource**: `"argument"`

Defined in: [lib/no-spaghetti-options.ts:34](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L34)

Uses the argument selected by `argumentIndex` to calculate the command score.
