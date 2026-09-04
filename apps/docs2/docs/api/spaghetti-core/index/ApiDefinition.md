---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L129
---

# Type Alias: ApiDefinition

> **ApiDefinition** = [`MethodApiDefinition`](MethodApiDefinition.md) \| [`FunctionApiDefinition`](FunctionApiDefinition.md) \| [`CallApiDefinition`](CallApiDefinition.md) \| [`RecognizedApiDefinition`](RecognizedApiDefinition.md)

Defined in: [lib/recognizers/types.ts:129](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-core/src/lib/recognizers/types.ts#L129)

Configures JSON-friendly API recognition and leaf penalties. A definition
recognizes methods, standalone functions, or exact source-level calls. A
name-and-penalty definition changes the penalty of a built-in API.

A definition never combines `methods`, `functions`, or `calls`.

## Example

These calls both modify `cache`, but expose it differently:

```ts
cache.write(value);
writeCache(cache, value);
```

```json
{
  "apis": [
    {
      "name": "Cache.write",
      "methods": ["write"],
      "receiverNames": ["cache"],
      "resource": "receiver"
    },
    {
      "name": "Cache.writeFunction",
      "functions": ["writeCache"],
      "resource": "argument",
      "argumentIndex": 0,
      "penalty": 5
    }
  ]
}
```
