## Optional and experimental: Minimize spaghetti code

`@state-adapt/eslint-plugin-spaghetti` helps minimize spaghetti code. It analyzes
imperative commands and warns when they reach too far across functions, scopes,
files, or folders.

Install the plugin and its peer dependencies:

```sh
npm install --save-dev @state-adapt/eslint-plugin-spaghetti @state-adapt/spaghetti-core @typescript-eslint/parser eslint
```

Then extend its recommended configuration in your ESLint config:

```json
{
  "extends": ["plugin:@state-adapt/spaghetti/recommended"]
}
```
