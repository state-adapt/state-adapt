# `no-spaghetti`

> **Experimental:** The rule and its configuration may change as we learn from real-world use.

The rule helps minimize spaghetti code by warning on imperative commands that reach too far from the code they affect. Warnings appear on the individual command or caller line.

## How It Works

Each command moves through the following pipeline:

1. **Detect commands from syntax.** The rule recognizes general command
   syntax such as:

   ```ts
   status = 'ready'; // assignment
   user.name = 'Ada'; // property mutation
   count++; // increment
   delete cache.value; // delete
   save(); // function call with an ignored return value
   ```

2. **Recognize and name APIs.** Recognizers add semantic understanding that
   syntax alone cannot provide. The built-in `javascript`, `dom`, and
   `framework` recognizers identify APIs such as `Array.push`, `DOM.appendChild`,
   and `Angular.bootstrapApplication`. All three recognizers are enabled by
   default. `apiPatterns` can define additional project-specific APIs. For
   example, this pattern recognizes `track()` imported from `analytics` and names
   it `Analytics.track`:

   ```json
   {
     "name": "Analytics.track",
     "functions": ["track"],
     "importSources": ["analytics"]
   }
   ```

3. **Apply policy.** The rule measures how far the command reaches, calculates
   its score, and decides whether to allow or report it. `allowedApis` permits
   recognized API names; `allowedCalls` is the source-name fallback for calls
   without a recognized API identity. For example, this complete configuration
   allows the recognized API above and a relatively harmless logging command:

   ```json
   {
     "rules": {
       "@state-adapt/spaghetti/no-spaghetti": [
         "warn",
         {
           "apiPatterns": [
             {
               "name": "Analytics.track",
               "functions": ["track"],
               "importSources": ["analytics"]
             }
           ],
           "allowedApis": ["Analytics.track"],
           "allowedCalls": ["console.log"]
         }
       ]
     }
   }
   ```

A recognizer answers “what is this?”; policy determines how it should be
treated. The framework recognizer identifies common Angular, React, Vue, Svelte,
Solid, and Preact application entry points, and the default policy allows those
recognized names.

See [`NoSpaghettiOptions`](/api/eslint-plugin-spaghetti/index/NoSpaghettiOptions)
for scoring defaults and all configuration options. For project-specific API
recognition, see the
[`apiPatterns` example](/api/eslint-plugin-spaghetti/index/NoSpaghettiApiPattern).

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
