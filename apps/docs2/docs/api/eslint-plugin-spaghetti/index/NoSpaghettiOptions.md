---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L44
---

# Interface: NoSpaghettiOptions

Defined in: [lib/no-spaghetti-options.ts:44](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L44)

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
`1 × 30 = 30`, so it is reported unless its API has a zero penalty.

## Properties

### apis?

> `optional` **apis**: [`ApiDefinition`](../../spaghetti-core/index/ApiDefinition.md)[]

Defined in: [lib/no-spaghetti-options.ts:113](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L113)

Recognizes, names, and optionally assigns leaf penalties to APIs. An entry with
only a name and penalty configures an already-recognized built-in API. A zero
penalty discards that command before propagation. Defaults include zero
penalties for common framework application entry points.

A call chain retains the name of the recognized API that started it. For
example, calling `.catch()` on the result of `bootstrapApplication()` is still
identified as `Angular.bootstrapApplication`. See [ApiDefinition](../../spaghetti-core/index/ApiDefinition.md) for
the supported definition shapes and examples.

***

### builtInRecognizers?

> `optional` **builtInRecognizers**: (`"javascript"` \| `"dom"` \| `"framework"`)[]

Defined in: [lib/no-spaghetti-options.ts:119](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L119)

Selects the API-specific recognizer families used in addition to general
command detection. JavaScript collection, DOM mutation, and framework entry
point recognizers are enabled by default; an empty list disables all three.

***

### crossFileAnalysis?

> `optional` **crossFileAnalysis**: `boolean`

Defined in: [lib/no-spaghetti-options.ts:89](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L89)

Determines whether a command found in another file is propagated back
through a resolved call and assessed at the caller. Setting this to `false`
retains direct-command and same-file analysis. Defaults to `true`.

***

### declarationLineDistanceWeight?

> `optional` **declarationLineDistanceWeight**: `number`

Defined in: [lib/no-spaghetti-options.ts:56](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L56)

Multiplies the source-line distance from a command to the declaration it
mutates. For resolved calls in the same file, it also multiplies the line
distance from each call site to the called function's declaration. Lines 1 and
7 are six line-distance units. Defaults to `1` point per unit.

***

### externalPenalty?

> `optional` **externalPenalty**: `number`

Defined in: [lib/no-spaghetti-options.ts:83](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L83)

Sets the penalty added when a command's affected resource or implementation
is proven to be outside the analyzed TypeScript program. Unknown value origins
do not receive this penalty. Imports resolved to another analyzed file use file
and folder weights instead.
API-specific penalties can be configured with `apis`. Defaults to `100`.

***

### fileWeight?

> `optional` **fileWeight**: `number`

Defined in: [lib/no-spaghetti-options.ts:68](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L68)

Multiplies the number of trace edges that cross file boundaries. A resolved
call or imported resource in another analyzed file counts once, regardless of
directory depth. Defaults to `30` points per crossing.

***

### folderWeight?

> `optional` **folderWeight**: `number`

Defined in: [lib/no-spaghetti-options.ts:75](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L75)

Multiplies the number of directory edges between caller and callee files on a
cross-file trace edge. A call or resource reference from
`src/a/example.ts` to `src/b/example.ts` crosses two edges: one up to `src`,
then one down to `b`. Defaults to `15` points per edge.

***

### maxCallDepth?

> `optional` **maxCallDepth**: `number`

Defined in: [lib/no-spaghetti-options.ts:95](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L95)

Prevents recursive or cyclic call analysis from expanding without bound. Sets
the maximum number of resolved call hops followed from each function; longer
paths are omitted and reported as truncated. Defaults to `50` hops.

***

### maxCommandsPerFunction?

> `optional` **maxCommandsPerFunction**: `number`

Defined in: [lib/no-spaghetti-options.ts:101](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L101)

Prevents unbounded or combinatorial command-path expansion. Sets the maximum
number of direct and inherited command paths retained for each function;
additional paths are omitted and reported as truncated. Defaults to `10,000`.

***

### maxScore?

> `optional` **maxScore**: `number`

Defined in: [lib/no-spaghetti-options.ts:49](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L49)

Sets the greatest aggregate command score allowed without a warning. A score
equal to this value is allowed; a higher score is reported. Defaults to `6`.

***

### scopeWeight?

> `optional` **scopeWeight**: `number`

Defined in: [lib/no-spaghetti-options.ts:62](https://github.com/state-adapt/state-adapt/blob/main/libs/eslint-plugin-spaghetti/src/lib/no-spaghetti-options.ts#L62)

Multiplies the number of lexical scope boundaries crossed while tracing a
command to the declaration it mutates or a call to the function it resolves.
Counts accumulate along a resolved call chain. Defaults to `1` point per scope.
