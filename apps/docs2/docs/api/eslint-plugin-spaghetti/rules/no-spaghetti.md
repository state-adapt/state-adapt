# `no-spaghetti`

> **Experimental:** The rule and its configuration may change as we learn from real-world use.

The rule helps minimize spaghetti code by warning on imperative commands that reach too far from the code they affect. Warnings appear on the individual command or caller line.

## Configure exceptions

Intentional commands can be allowed in `.eslintrc.json`:

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

See [`NoSpaghettiOptions`](/api/eslint-plugin-spaghetti/index/NoSpaghettiOptions) for scoring defaults and all configuration options. For project-specific command APIs, see the [`apiPatterns` example](/api/eslint-plugin-spaghetti/index/NoSpaghettiApiPattern).

## JSX event handlers

In a JSX event handler, one command over `maxScore` is allowed. Additional over-threshold commands are reported; allowlisted commands do not consume the allowance.

```tsx
import { close, save } from './actions';

<button
  onClick={event => {
    event.preventDefault(); // Allowed: local, distance score 1
    save(); // Allowed: one remote command
    close(); // Warning: another remote command
  }}
/>;
```

## Templates (Angular, Svelte)

Commands written directly in Angular and Svelte templates are allowed because `no-spaghetti` does not parse template syntax. Template handlers remain inline; any JavaScript or TypeScript function they call is still analyzed normally.
