## Optional: Minimize spaghetti code

> **Experimental:** The rule and its configuration may change as we learn from real-world use.

`@state-adapt/eslint-plugin-spaghetti` helps minimize spaghetti code. It analyzes
imperative commands and warns when they reach too far across functions, scopes,
files, or folders.

Install the plugin and its peer dependencies:

```sh
npm install --save-dev @state-adapt/eslint-plugin-spaghetti @state-adapt/spaghetti-core @typescript-eslint/parser eslint
```

Then extend its recommended configuration for TypeScript files in `.eslintrc.json`:

```json
{
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "extends": ["plugin:@state-adapt/spaghetti/recommended"]
    }
  ]
}
```

This rule requires type-aware linting to resolve calls and resources across the
project. With `@typescript-eslint/parser` v8 or newer, enable the TypeScript
project service in the configuration that applies to TypeScript files:

```json
{
  "languageOptions": {
    "parserOptions": {
      "projectService": true
    }
  }
}
```

Legacy `.eslintrc` configurations and parser v7 use `parserOptions.project`:

```json
{
  "parserOptions": {
    "project": ["./tsconfig.json"]
  }
}
```

These examples show the underlying typescript-eslint settings. Tooling that
manages ESLint configuration may require them elsewhere. See the
[typescript-eslint typed-linting guide](https://typescript-eslint.io/getting-started/typed-linting/)
for general setup, or
[Configuring ESLint with TypeScript](https://nx.dev/docs/kb/configuring-eslint-with-typescript)
for Nx workspaces, including flat and legacy configurations.

For advanced configuration, see the [`no-spaghetti` rule reference](/api/eslint-plugin-spaghetti/rules/no-spaghetti).
