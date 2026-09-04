# @state-adapt/spaghetti-core

Shared TypeScript AST analysis for discovering commands, propagating them through project-function call chains, measuring their distance, and calculating configurable spaghetti scores.

Known mutation APIs are represented as `api-command` commands only when general syntax
does not already identify the operation as imperative and the API returns a usable
value. For example, bare calls are general `discarded-call` commands, while a nested
`values.push(value)` needs API recognition because `push` returns the new length.
JavaScript, DOM, and framework recognizers are enabled by default. Void-only
mutation APIs, including RxJS subjects, React setters, Angular signals, and
StateAdapt stores, do not need built-in fallback recognizers. Programmatic core
consumers can supply `CommandRecognizer` objects or JSON-friendly `apis`
definitions. An API definition can recognize a call and assign its leaf penalty;
zero-penalty commands are discarded before propagation. Framework entry points
have zero penalties by default and can be overridden by name.

Scores have an additive `scoreBreakdown`. Configure command-kind bases, external
penalties, declaration-line distance, function-call distance, scope, file and
folder crossings, same-function distance, and function size through
`AnalysisOptions.scoring`. Commands whose target or implementation is outside the
analyzed program receive an external penalty of `100` by default.

Analysis is type-aware. `analyzeFile` creates a reusable in-memory TypeScript
program, `analyzeProject` loads project compiler settings, and `analyzeProgram`
reuses an existing program. Project call paths are bounded by
`maxCallDepth` and `maxCommandsPerFunction`.

Propagation follows resource ownership across function boundaries. Mutations of
allocations owned by a callee remain implementation details of that callee, while
parameter mutations are rebound to caller arguments and shared, captured, class,
module, external, and unknown effects continue through the call graph. Unknown
origins remain conservative effects without being mislabeled as external.

Functions used as JSX event handlers expose neutral `jsxEventHandler` context.
Core never removes a handler command from aggregate scores; consumer-specific
allowances belong to the consumer.

## Building

Run `nx build spaghetti-core` to build the library.

## Running unit tests

Run `nx test spaghetti-core` to execute the unit tests via [Jest](https://jestjs.io).
