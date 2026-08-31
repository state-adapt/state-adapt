# @state-adapt/eslint-plugin-spaghetti

> **Experimental:** The rule and its configuration may change as we learn from real-world use.

This ESLint plugin helps you minimize imperative code. It warns on individual commands that reach too far across functions, scopes, files, or folders, so the warning points to the line that needs attention.

## Setup

Install the plugin and its peer dependencies:

```bash
npm install --save-dev @state-adapt/eslint-plugin-spaghetti @state-adapt/spaghetti-core @typescript-eslint/parser eslint
```

Then add the recommended configuration to your ESLint config:

```json
{
  "extends": ["plugin:@state-adapt/spaghetti/recommended"]
}
```

The files you lint must be included in the TypeScript project used by ESLint.

## Configuration

The recommended configuration enables `@state-adapt/spaghetti/no-spaghetti` as a warning. You can tune it to fit your project:

```json
{
  "rules": {
    "@state-adapt/spaghetti/no-spaghetti": [
      "warn",
      {
        "max": 2,
        "scopeWeight": 1,
        "functionCallWeight": 1,
        "fileWeight": 2,
        "folderWeight": 3,
        "externalPenalty": "maximum",
        "allowedCalls": ["console.log"]
      }
    ]
  }
}
```

The main options are:

- `max`: the greatest command distance allowed without a warning.
- Distance weights: control how strongly scope, function-call, file, folder, and local line boundaries count.
- `externalPenalty`: treat unresolved external commands as maximally distant, ignore them, or assign a numeric penalty.
- `allowedCalls` and `allowedApis`: explicitly permit commands your project considers acceptable.
- `crossFileAnalysis`: disable cross-file analysis when needed; it is enabled by default.

JSX event handlers receive an allowance for one command, while additional commands are evaluated normally.
