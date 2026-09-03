---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L136
---

# Interface: NoSpaghettiOptions

Defined in: [lib/no-spaghetti-options.ts:136](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L136)

Configures which commands the `@state-adapt/spaghetti/no-spaghetti` rule reports
and how it calculates each command's score.

## Example

A command is allowed when its aggregate score is at most `maxScore`; a higher
score produces a warning. In `.eslintrc.json`, the default policy is:

```json
{
  "rules": {
    "@state-adapt/spaghetti/no-spaghetti": [
      "warn",
      {
        "maxScore": 6,
        "declarationLineDistanceWeight": 1,
        "scopeWeight": 1,
        "fileWeight": 30,
        "folderWeight": 15,
        "externalPenalty": 100
      }
    ]
  }
}
```

Each measured count is multiplied by its weight. This configuration penalizes
file and folder crossings more heavily because they require more navigation than
nearby code. Resolved calls extend the trace instead of adding a fixed call cost.

```ts
function save(draft: { saved: boolean }): void {
  draft.saved = true;
}
```

Here the resource declaration is one line from the command, so its score is
`1 × 1 = 1` and it is allowed. A resolved call to a command in another file
or a direct reference to a resource in another file receives at least
`1 × 30 = 30`, so it is reported unless explicitly allowlisted.

## Properties

### allowedApis?

> `optional` **allowedApis**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:191](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L191)

Lists additional recognized API names that never produce warnings, regardless
of score. The rule includes import-aware defaults for common Angular, React,
Vue, Svelte, Solid, and Preact application entry points.

A call chain retains the name of the recognized API that started it. For
example, calling `.catch()` on the result of `bootstrapApplication()` is still
identified as `Angular.bootstrapApplication`.

***

### allowedCalls?

> `optional` **allowedCalls**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:181](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L181)

Lists exact source-level call names that never produce warnings, regardless of
score. For example, `"console.log"` matches `console.log()`. Defaults to an
empty list.

***

### apiPatterns?

> `optional` **apiPatterns**: [`NoSpaghettiApiPattern`](NoSpaghettiApiPattern.md)[]

Defined in: [lib/no-spaghetti-options.ts:216](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L216)

Defines project-specific call patterns that should be recognized as commands
when general command detection would otherwise miss them. Each pattern also
identifies the affected resource used to calculate the score. Defaults to an
empty list.

***

### builtInRecognizers?

> `optional` **builtInRecognizers**: (`"javascript"` \| `"dom"` \| `"framework"`)[]

Defined in: [lib/no-spaghetti-options.ts:222](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L222)

Selects the API-specific recognizer families used in addition to general
command detection. JavaScript collection, DOM mutation, and framework entry
point recognizers are enabled by default; an empty list disables all three.

***

### crossFileAnalysis?

> `optional` **crossFileAnalysis**: `boolean`

Defined in: [lib/no-spaghetti-options.ts:197](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L197)

Determines whether a command found in another file is propagated back
through a resolved call and assessed at the caller. Setting this to `false`
retains direct-command and same-file analysis. Defaults to `true`.

***

### declarationLineDistanceWeight?

> `optional` **declarationLineDistanceWeight**: `number`

Defined in: [lib/no-spaghetti-options.ts:148](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L148)

Multiplies the source-line distance from a command to the declaration it
mutates. For resolved calls in the same file, it also multiplies the line
distance from each call site to the called function's declaration. Lines 1 and
7 are six line-distance units. Defaults to `1` point per unit.

***

### externalPenalty?

> `optional` **externalPenalty**: `number`

Defined in: [lib/no-spaghetti-options.ts:175](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L175)

Sets the penalty added when a command's affected resource or implementation
cannot be resolved inside the analyzed TypeScript program. Imports resolved to
another analyzed file use file and folder weights instead.
Intentional exceptions should use `allowedCalls` or `allowedApis`. Defaults to
`100`.

***

### fileWeight?

> `optional` **fileWeight**: `number`

Defined in: [lib/no-spaghetti-options.ts:160](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L160)

Multiplies the number of trace edges that cross file boundaries. A resolved
call or imported resource in another analyzed file counts once, regardless of
directory depth. Defaults to `30` points per crossing.

***

### folderWeight?

> `optional` **folderWeight**: `number`

Defined in: [lib/no-spaghetti-options.ts:167](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L167)

Multiplies the number of directory edges between caller and callee files on a
cross-file trace edge. A call or resource reference from
`src/a/example.ts` to `src/b/example.ts` crosses two edges: one up to `src`,
then one down to `b`. Defaults to `15` points per edge.

***

### maxCallDepth?

> `optional` **maxCallDepth**: `number`

Defined in: [lib/no-spaghetti-options.ts:203](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L203)

Prevents recursive or cyclic call analysis from expanding without bound. Sets
the maximum number of resolved call hops followed from each function; longer
paths are omitted and reported as truncated. Defaults to `50` hops.

***

### maxCommandsPerFunction?

> `optional` **maxCommandsPerFunction**: `number`

Defined in: [lib/no-spaghetti-options.ts:209](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L209)

Prevents unbounded or combinatorial command-path expansion. Sets the maximum
number of direct and inherited command paths retained for each function;
additional paths are omitted and reported as truncated. Defaults to `10,000`.

***

### maxScore?

> `optional` **maxScore**: `number`

Defined in: [lib/no-spaghetti-options.ts:141](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L141)

Sets the greatest aggregate command score allowed without a warning. A score
equal to this value is allowed; a higher score is reported. Defaults to `6`.

***

### scopeWeight?

> `optional` **scopeWeight**: `number`

Defined in: [lib/no-spaghetti-options.ts:154](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L154)

Multiplies the number of lexical scope boundaries crossed while tracing a
command to the declaration it mutates or a call to the function it resolves.
Counts accumulate along a resolved call chain. Defaults to `1` point per scope.
