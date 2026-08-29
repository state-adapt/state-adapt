# @state-adapt/spaghetti-core

Shared TypeScript AST analysis for discovering commands, propagating them through project-function call chains, measuring their distance, and calculating configurable spaghetti scores.

Known mutation APIs are represented as `api-command` commands only when general syntax
does not already identify the operation as imperative and the API returns a usable
value. For example, bare calls are general `discarded-call` commands, while a nested
`values.push(value)` needs API recognition because `push` returns the new length.
JavaScript, DOM, and Redux recognizers are enabled by default. Void-only mutation APIs,
including RxJS subjects, React setters, Angular signals, and StateAdapt stores, do not
need built-in fallback recognizers.
Programmatic consumers can supply `CommandRecognizer` objects. JSON and ESLint
configurations can use `apiPatterns` and can select families with
`builtInRecognizers`. Recognizers identify only the API and resource; the shared
analyzer remains responsible for resolution, distance, propagation, and scoring.

Scores have an additive `scoreBreakdown`. Configure command-kind bases,
API-specific bases, declaration-line distance, function-call distance, scope and
file crossings, same-function distance, and function size through
`AnalysisOptions.scoring`. The V1-V3 `lineDistanceWeight`,
`scopeDistanceWeight`, and `fileDistanceWeight` keys remain accepted.

## Building

Run `nx build spaghetti-core` to build the library.

## Running unit tests

Run `nx test spaghetti-core` to execute the unit tests via [Jest](https://jestjs.io).
