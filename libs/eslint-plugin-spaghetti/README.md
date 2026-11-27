# @state-adapt/eslint-plugin-spaghetti

This ESLint plugin helps you minimize spaghetti code. It reports imperative code that reaches too far across functions, scopes, files, or folders.

## Getting Started

> **Experimental:** The rule and its configuration may change as we learn from real-world use.

Install the plugin and its peer dependencies:

```sh
npm install --save-dev @state-adapt/eslint-plugin-spaghetti @state-adapt/spaghetti-core @typescript-eslint/parser eslint typescript
```

Add the rule to your flat ESLint config (for example, `eslint.config.mjs`).
The TypeScript project service provides the type information the rule needs
to resolve calls and resources across files:

```js
import spaghetti from '@state-adapt/eslint-plugin-spaghetti';
import parser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      parser,
      parserOptions: { projectService: true },
    },
    plugins: { '@state-adapt/spaghetti': spaghetti },
    rules: { '@state-adapt/spaghetti/no-spaghetti': 'error' },
  },
];
```

Run `npx eslint .` from your project. With older ESLint versions that still use
`.eslintrc`, add an override for your TypeScript files that extends
`plugin:@state-adapt/spaghetti/recommended` and sets
`parser: "@typescript-eslint/parser"` and `parserOptions.project`
(for example, `["./tsconfig.json"]`).

See the [typescript-eslint typed-linting guide](https://typescript-eslint.io/getting-started/typed-linting/)
for general setup and the [`no-spaghetti` rule reference](https://state-adapt.github.io/api/eslint-plugin-spaghetti/rules/no-spaghetti)
for its policy, options, and examples.
