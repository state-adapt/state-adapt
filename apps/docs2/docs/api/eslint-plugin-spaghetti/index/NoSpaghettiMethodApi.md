---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L15
---

# Interface: NoSpaghettiMethodApi

Defined in: [lib/no-spaghetti-options.ts:15](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L15)

Use this definition for commands called as methods, such as `cache.write()`.
The method receiver can be treated as the affected resource.

## Extends

- `NoSpaghettiApiBase`

## Properties

### argumentIndex?

> `optional` **argumentIndex**: `number`

Defined in: [lib/no-spaghetti-options.ts:27](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L27)

Selects the argument used to calculate the command score. `0` means the first argument.

---

### importSources?

> `optional` **importSources**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:23](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L23)

Restricts recognition to APIs imported from these module specifiers.

---

### methods

> **methods**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:17](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L17)

Lists command method names, such as `write` in `cache.write()`.

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

### receiverNames?

> `optional` **receiverNames**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:21](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L21)

Restricts method calls by receiver name, such as `cache` in `cache.write()`.

---

### resource?

> `optional` **resource**: `"receiver"` \| `"argument"`

Defined in: [lib/no-spaghetti-options.ts:25](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L25)

Selects the receiver or argument used to calculate the command score.
