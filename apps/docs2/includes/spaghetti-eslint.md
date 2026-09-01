## Optional: Minimize spaghetti code

> **Experimental:** The rule and its configuration may change as we learn from real-world use.

`@state-adapt/eslint-plugin-spaghetti` helps minimize spaghetti code. It analyzes
imperative commands and warns when they reach too far across functions, scopes,
files, or folders.

Install the plugin and its peer dependencies:

```sh
npm install --save-dev @state-adapt/eslint-plugin-spaghetti @state-adapt/spaghetti-core @typescript-eslint/parser eslint
```

Then extend its recommended configuration in `.eslintrc.json`:

```json
{
  "extends": ["plugin:@state-adapt/spaghetti/recommended"]
}
```

For advanced configuration, see the [`no-spaghetti` rule reference](/api/eslint-plugin-spaghetti/rules/no-spaghetti).
