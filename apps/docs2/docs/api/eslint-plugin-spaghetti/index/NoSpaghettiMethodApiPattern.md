---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L5
---

# Interface: NoSpaghettiMethodApiPattern

Defined in: [lib/no-spaghetti-options.ts:5](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L5)

Use this pattern for commands called as methods, such as `cache.write()`.
The method receiver can be treated as the affected resource.

## Properties

### argumentIndex?

> `optional` **argumentIndex**: `number`

Defined in: [lib/no-spaghetti-options.ts:18](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L18)

Selects the argument used to calculate the command score. `0` means the first argument.

***

### importSources?

> `optional` **importSources**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:14](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L14)

Restricts recognition to APIs imported from these module specifiers.

***

### methods

> **methods**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:9](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L9)

Lists command method names, such as `write` in `cache.write()`.

***

### name

> **name**: `string`

Defined in: [lib/no-spaghetti-options.ts:7](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L7)

Names the pattern so it can be referenced by `allowedApis`.

***

### receiverNames?

> `optional` **receiverNames**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:12](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L12)

Restricts method calls by receiver name, such as `cache` in `cache.write()`.

***

### resource?

> `optional` **resource**: `"receiver"` \| `"argument"`

Defined in: [lib/no-spaghetti-options.ts:16](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L16)

Selects the receiver or argument used to calculate the command score.
