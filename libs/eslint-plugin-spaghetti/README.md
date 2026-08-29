# @state-adapt/eslint-plugin-spaghetti

Thin ESLint rules powered by `@state-adapt/spaghetti-core`.

The recommended config enables `@typescript-eslint/parser` project parsing so
the plugin can reuse its TypeScript program. Type-aware command detection is always enabled;
cross-file command propagation is enabled by default and can be disabled per
rule with `crossFileAnalysis: false`.

Concise arrows returning `void` are commands. JSX event handlers retain all
commands in analysis but receive an allowance for their highest-scoring one.
File and folder crossings have independent scoring weights.

`maxCallDepth` and `maxCommandsPerFunction` bound graph expansion. Reaching a
limit produces an explicit incomplete-analysis diagnostic.

## Building

Run `nx build eslint-plugin-spaghetti` to build the library.

## Running unit tests

Run `nx test eslint-plugin-spaghetti` to execute the unit tests via [Jest](https://jestjs.io).
