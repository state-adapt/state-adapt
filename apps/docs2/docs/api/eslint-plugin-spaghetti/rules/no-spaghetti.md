# `no-spaghetti`

> **Experimental:** The rule and its configuration may change as we learn from real-world use.

The rule warns when an imperative command's aggregate score exceeds `maxScore`. Warnings appear on the command or caller line that crossed the limit.

The score is the sum of each measured count multiplied by its weight. Resolved calls extend the trace: same-file calls contribute call-to-declaration line distance, while cross-file calls and imported resources contribute file and folder crossings. There is no fixed function-call penalty.

Unresolved external commands receive a score penalty of `200`. Use `allowedCalls` or `allowedApis` for intentional exceptions.

```json
{
  "rules": {
    "@state-adapt/spaghetti/no-spaghetti": [
      "warn",
      {
        "allowedCalls": ["console.log"]
      }
    ]
  }
}
```

For project-specific command APIs, see the complete [`apiPatterns` example](/api/eslint-plugin-spaghetti/index/NoSpaghettiApiPattern).

In a JSX event handler, the command with the highest score is exempt. Remaining commands are evaluated normally.

See [`NoSpaghettiOptions`](/api/eslint-plugin-spaghetti/index/NoSpaghettiOptions) for the default policy, a worked example, and the complete option reference.
