---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L130
---

# Type Alias: NoSpaghettiApi

> **NoSpaghettiApi** = [`NoSpaghettiMethodApi`](NoSpaghettiMethodApi.md) \| [`NoSpaghettiFunctionApi`](NoSpaghettiFunctionApi.md) \| [`NoSpaghettiCallApi`](NoSpaghettiCallApi.md) \| [`NoSpaghettiRecognizedApi`](NoSpaghettiRecognizedApi.md)

Defined in: [lib/no-spaghetti-options.ts:130](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L130)

Configures how the rule recognizes, names, and optionally assigns a starting
penalty to an API command.

API definitions may recognize method calls, standalone functions, or exact
source-level call names. A name-only entry configures a built-in API.

- For `receiver.method()` calls, use [NoSpaghettiMethodApi](NoSpaghettiMethodApi.md).
- For standalone `function()` calls, use [NoSpaghettiFunctionApi](NoSpaghettiFunctionApi.md).
- For an exact source-level call name, use [NoSpaghettiCallApi](NoSpaghettiCallApi.md).
- To change a built-in API's penalty, use [NoSpaghettiRecognizedApi](NoSpaghettiRecognizedApi.md).

A definition never combines `methods`, `functions`, or `calls`.

## Example

Both calls below modify `cache`, but they pass it to the API differently:

```ts
import { cache, writeCache } from 'cache-library';

cache.write(value); // `cache` is the method receiver.
writeCache(cache, value); // `cache` is the first argument.
```

This configuration in `.eslintrc.json` tells the rule to use `cache` when
calculating the score of either command:

```json
{
  "rules": {
    "@state-adapt/spaghetti/no-spaghetti": [
      "warn",
      {
        "apis": [
          {
            "name": "cache.methodWrite",
            "methods": ["write"],
            "receiverNames": ["cache"],
            "importSources": ["cache-library"],
            "resource": "receiver"
          },
          {
            "name": "cache.functionWrite",
            "functions": ["writeCache"],
            "importSources": ["cache-library"],
            "resource": "argument",
            "argumentIndex": 0
          }
        ]
      }
    ]
  }
}
```
