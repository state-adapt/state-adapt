# `no-spaghetti`

> **Experimental:** The rule and its configuration may change as we learn from real-world use.

The rule helps minimize spaghetti code by warning on imperative commands that reach too far from the code they affect. Warnings appear on the individual command or caller line.

## How It Works

Each command moves through the following pipeline:

1. **Detects commands from syntax.** The rule recognizes general command
   syntax such as:

   ```ts
   status = 'ready'; // assignment
   user.name = 'Ada'; // property mutation
   count++; // increment
   delete cache.value; // delete
   save(); // function call with an ignored return value
   ```

2. **Recognize, name, and assign API penalties.** Recognizers add semantic
   understanding that syntax alone cannot provide. The built-in `javascript`,
   `dom`, and `framework` recognizers identify APIs such as `Array.push`,
   `DOM.appendChild`, and `Angular.bootstrapApplication`. All three recognizers
   are enabled by default, and common framework entry points have a penalty of
   `0`.

   The `apis` option can define additional APIs and their starting penalties.
   For example, `router.navigate()` from `@app/router` changes the application's
   current route. This configuration names it `Router.navigate` and gives it a
   penalty of `5`. It also recognizes `console.log()` by its exact source-level
   name and gives it a penalty of `0`:

   ```json
   {
     "rules": {
       "@state-adapt/spaghetti/no-spaghetti": [
         "warn",
         {
           "apis": [
             {
               "name": "Router.navigate",
               "methods": ["navigate"],
               "importSources": ["@app/router"],
               "penalty": 5
             },
             {
               "name": "Console.log",
               "calls": ["console.log"],
               "penalty": 0
             }
           ]
         }
       ]
     }
   }
   ```

   A penalty of `0` drops the command immediately. A positive penalty starts a
   command trace at that value.

3. **Traces and reports commands.** The rule adds line, scope, file, and folder
   costs as each surviving command reaches through the codebase, then compares
   the total score with `maxScore`. With the default `maxScore` of `6`, the
   `Router.navigate` configuration above behaves like this:

   ```ts
   // navigation.ts
   import { router } from '@app/router';

   export const settingsUrl = '/settings';

   export function openSettings() {
     router.navigate('/settings');
   }

   // profile.ts
   import { router } from '@app/router';
   import { openSettings, settingsUrl } from './navigation';

   router.navigate(settingsUrl); // Starts at 5, so it is allowed here.

   openSettings(); // Error: crossing files adds to the score.
   ```

See [`NoSpaghettiOptions`](/api/eslint-plugin-spaghetti/index/NoSpaghettiOptions)
for scoring defaults and all configuration options. For project-specific API
recognition, see the
[`ApiDefinition` reference](/api/spaghetti-core/index/ApiDefinition).

## JSX event handlers

In a JSX event handler, one command over `maxScore` is allowed. Additional over-threshold commands are reported; zero-penalty commands do not consume the allowance.

```tsx
import { close, save } from './actions';

<button
  onClick={event => {
    event.preventDefault(); // Allowed: local, distance score 1
    save(); // Allowed: one remote command
    close(); // Error: another remote command
  }}
/>;
```

## Templates (Angular, Svelte)

Commands written directly in Angular and Svelte templates are allowed because `no-spaghetti` does not parse template syntax. Template handlers remain inline; any JavaScript or TypeScript function they call is still analyzed normally.
