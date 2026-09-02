# @state-adapt/eslint-plugin-spaghetti

This ESLint plugin helps you minimize spaghetti code. It reports imperative code that reaches too far across functions, scopes, files, or folders.

> **Experimental:** The rule and its configuration may change as we learn from real-world use.

## Setup

Install the plugin and its peer dependencies:

```bash
npm install --save-dev @state-adapt/eslint-plugin-spaghetti @state-adapt/spaghetti-core @typescript-eslint/parser eslint
```

Then add the recommended configuration to `.eslintrc.json`:

```json
{
  "extends": ["plugin:@state-adapt/spaghetti/recommended"]
}
```

## Configuration

The recommended configuration enables `@state-adapt/spaghetti/no-spaghetti` as an error. See the [`no-spaghetti` rule reference](https://state-adapt.github.io/api/eslint-plugin-spaghetti/rules/no-spaghetti) for its policy, options, and examples.
