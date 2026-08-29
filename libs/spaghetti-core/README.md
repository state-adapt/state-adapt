# @state-adapt/spaghetti-core

Shared TypeScript AST analysis for discovering commands, propagating them through project-function call chains, measuring their distance, and calculating configurable spaghetti scores.

Known mutation APIs are represented as `api-command` commands only when general syntax
does not already identify the operation as imperative. For example, a bare
`subject.next(value)` is a general `discarded-call`, while a returned or nested
`subject.next(value)` needs API recognition. JavaScript, DOM, StateAdapt, React,
Angular, RxJS, and Redux recognizers are enabled by default.
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
