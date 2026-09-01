---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L122
---

# Interface: NoSpaghettiOptions

Defined in: [lib/no-spaghetti-options.ts:122](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L122)

Configures which commands the `@state-adapt/spaghetti/no-spaghetti` rule reports
and how it calculates each command's score.

## Example

A command is allowed when its aggregate score is at most `maxScore`; a higher
score produces a warning. The default policy is:

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
        "folderWeight": 10,
        "externalPenalty": 200
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

Defined in: [lib/no-spaghetti-options.ts:173](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L173)

Lists recognized API names that never produce warnings, regardless of score.
These are built-in names such as `"Array.push"` or the `name` of a custom
`apiPatterns` entry. Defaults to an empty list.

***

### allowedCalls?

> `optional` **allowedCalls**: `string`[]

Defined in: [lib/no-spaghetti-options.ts:167](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L167)

Lists exact source-level call names that never produce warnings, regardless of
score. For example, `"console.log"` matches `console.log()`. Defaults to an
empty list.

***

### apiPatterns?

> `optional` **apiPatterns**: [`NoSpaghettiApiPattern`](NoSpaghettiApiPattern.md)[]

Defined in: [lib/no-spaghetti-options.ts:198](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L198)

Defines project-specific call patterns that should be recognized as commands
when general command detection would otherwise miss them. Each pattern also
identifies the affected resource used to calculate the score. Defaults to an
empty list.

***

### builtInRecognizers?

> `optional` **builtInRecognizers**: (`"javascript"` \| `"dom"`)[]

Defined in: [lib/no-spaghetti-options.ts:204](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L204)

Selects the API-specific recognizer families used in addition to general
command detection. JavaScript collection and DOM mutation recognizers are
enabled by default; an empty list disables both.

***

### crossFileAnalysis?

> `optional` **crossFileAnalysis**: `boolean`

Defined in: [lib/no-spaghetti-options.ts:179](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L179)

Determines whether a command found in another file is propagated back
through a resolved call and assessed at the caller. Setting this to `false`
retains direct-command and same-file analysis. Defaults to `true`.

***

### declarationLineDistanceWeight?

> `optional` **declarationLineDistanceWeight**: `number`

Defined in: [lib/no-spaghetti-options.ts:134](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L134)

Multiplies the source-line distance from a command to the declaration it
mutates. For resolved calls in the same file, it also multiplies the line
distance from each call site to the called function's declaration. Lines 1 and
7 are six line-distance units. Defaults to `1` point per unit.

***

### externalPenalty?

> `optional` **externalPenalty**: `number`

Defined in: [lib/no-spaghetti-options.ts:161](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L161)

Sets the penalty added when a command's affected resource or implementation
cannot be resolved inside the analyzed TypeScript program. Imports resolved to
another analyzed file use file and folder weights instead.
Intentional exceptions should use `allowedCalls` or `allowedApis`. Defaults to
`200`.

***

### fileWeight?

> `optional` **fileWeight**: `number`

Defined in: [lib/no-spaghetti-options.ts:146](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L146)

Multiplies the number of trace edges that cross file boundaries. A resolved
call or imported resource in another analyzed file counts once, regardless of
directory depth. Defaults to `30` points per crossing.

***

### folderWeight?

> `optional` **folderWeight**: `number`

Defined in: [lib/no-spaghetti-options.ts:153](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L153)

Multiplies the number of directory edges between caller and callee files on a
cross-file trace edge. A call or resource reference from
`src/a/example.ts` to `src/b/example.ts` crosses two edges: one up to `src`,
then one down to `b`. Defaults to `10` points per edge.

***

### maxCallDepth?

> `optional` **maxCallDepth**: `number`

Defined in: [lib/no-spaghetti-options.ts:185](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L185)

Prevents recursive or cyclic call analysis from expanding without bound. Sets
the maximum number of resolved call hops followed from each function; longer
paths are omitted and reported as truncated. Defaults to `50` hops.

***

### maxCommandsPerFunction?

> `optional` **maxCommandsPerFunction**: `number`

Defined in: [lib/no-spaghetti-options.ts:191](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L191)

Prevents unbounded or combinatorial command-path expansion. Sets the maximum
number of direct and inherited command paths retained for each function;
additional paths are omitted and reported as truncated. Defaults to `10,000`.

***

### maxScore?

> `optional` **maxScore**: `number`

Defined in: [lib/no-spaghetti-options.ts:127](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L127)

Sets the greatest aggregate command score allowed without a warning. A score
equal to this value is allowed; a higher score is reported. Defaults to `6`.

***

### scopeWeight?

> `optional` **scopeWeight**: `number`

Defined in: [lib/no-spaghetti-options.ts:140](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L140)

Multiplies the number of lexical scope boundaries crossed while tracing a
command to the declaration it mutates or a call to the function it resolves.
Counts accumulate along a resolved call chain. Defaults to `1` point per scope.
