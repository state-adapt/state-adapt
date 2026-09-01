---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L91
---

# Type Alias: NoSpaghettiApiPattern

> **NoSpaghettiApiPattern** = [`NoSpaghettiMethodApiPattern`](NoSpaghettiMethodApiPattern.md) \| [`NoSpaghettiFunctionApiPattern`](NoSpaghettiFunctionApiPattern.md)

Defined in: [lib/no-spaghetti-options.ts:91](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L91)

Configures how the rule recognizes commands from a project-specific API.

This is a union because method calls and standalone function calls identify
their affected resources differently. Choose the shape that matches the API:

- For `receiver.method()` calls, use [NoSpaghettiMethodApiPattern](NoSpaghettiMethodApiPattern.md).
- For standalone `function()` calls, use [NoSpaghettiFunctionApiPattern](NoSpaghettiFunctionApiPattern.md).

A pattern never uses both `methods` and `functions`.

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
        "apiPatterns": [
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
