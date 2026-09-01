---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L2
---

# Interface: NoSpaghettiMethodApiPattern

Defined in: [lib/no-spaghetti-options.ts:2](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L2)

Configures recognition for a project-specific method API.

## Properties

### argumentIndex?

> `optional` **argumentIndex**: `number`

Defined in: [lib/no-spaghetti-options.ts:15](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L15)

Selects the argument used to calculate the command score. `0` means the first argument.

***

### importSources?

> `optional` **importSources**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:11](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L11)

Restricts recognition to APIs imported from these module specifiers.

***

### methods

> **methods**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:6](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L6)

Lists command method names, such as `write` in `cache.write()`.

***

### name

> **name**: `string`

Defined in: [lib/no-spaghetti-options.ts:4](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L4)

Names the pattern so it can be referenced by `allowedApis`.

***

### receiverNames?

> `optional` **receiverNames**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:9](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L9)

Restricts method calls by receiver name, such as `cache` in `cache.write()`.

***

### resource?

> `optional` **resource**: `"receiver"` \| `"argument"`

Defined in: [lib/no-spaghetti-options.ts:13](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L13)

Selects the receiver or argument used to calculate the command score.
