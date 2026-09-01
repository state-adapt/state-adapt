---
definedIn:
---

# Interface: NoSpaghettiFunctionApiPattern

Defined in: lib/no-spaghetti-options.ts:19

Configures recognition for a project-specific function API.

## Properties

### argumentIndex?

> `optional` **argumentIndex**: `number`

Defined in: lib/no-spaghetti-options.ts:30

Selects the argument used to calculate the command score. `0` means the first argument.

---

### functions

> **functions**: `string`[]

Defined in: lib/no-spaghetti-options.ts:23

Lists command function names, such as `writeCache` in `writeCache(cache)`.

---

### importSources?

> `optional` **importSources**: `string`[]

Defined in: lib/no-spaghetti-options.ts:26

Restricts recognition to APIs imported from these module specifiers.

---

### name

> **name**: `string`

Defined in: lib/no-spaghetti-options.ts:21

Names the pattern so it can be referenced by `allowedApis`.

---

### resource?

> `optional` **resource**: `"argument"`

Defined in: lib/no-spaghetti-options.ts:28

Uses the argument selected by `argumentIndex` to calculate the command score.
