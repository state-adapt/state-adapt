---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L77
---

# Type Alias: NoSpaghettiApiPattern

> **NoSpaghettiApiPattern** = [`NoSpaghettiMethodApiPattern`](NoSpaghettiMethodApiPattern.md) \| [`NoSpaghettiFunctionApiPattern`](NoSpaghettiFunctionApiPattern.md)

Defined in: [lib/no-spaghetti-options.ts:77](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L77)

Configures how the rule recognizes commands from a project-specific API.

## Example

Both calls below modify `cache`, but they pass it to the API differently:

```ts
import { cache, writeCache } from 'cache-library';

cache.write(value); // `cache` is the method receiver.
writeCache(cache, value); // `cache` is the first argument.
```

This configuration tells the rule to use `cache` when calculating the
score of either command:

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
