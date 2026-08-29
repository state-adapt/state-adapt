## Architecture

Build three packages/tools.

### `@state-adapt/spaghetti-analysis`

Shared TypeScript utilities. This is the only place that understands ASTs, commands, call chains, distance, and scoring.

It exposes something like:

```ts
analyzeProject(...)
analyzeFile(...)
analyzeFunction(...)
```

and returns:

```ts
interface FunctionAnalysis {
  functionId: string;
  commands: Command[];
  score: number;
}

interface Command {
  kind: string;
  location: SourceLocation;

  // Where the actual command originates
  originFunction: string;

  // Every function call between the analyzed function
  // and the original command.
  callPath: CommandHop[];

  // Distance accumulated through that path.
  distance: Distance;

  score: number;
}
```

A caller inherits the actual downstream commands. Commands are never collapsed into a generic “effect count.”

### `eslint-plugin-state-adapt`

Thin ESLint rules that call `@state-adapt/spaghetti-analysis`.

Examples:

```text
max-spaghetti-score
max-command-distance
max-commands
no-remote-mutation
```

The ESLint package should not independently implement AST analysis.

### `state-adapt-spaghetti-report`

CLI/reporting tool that also calls `@state-adapt/spaghetti-analysis`.

Outputs:

```text
function scores
file scores
directory scores
whole-project score
command chains
distance metrics
JSON for visualizations
```

Later, charts/UI consume that JSON.

---

# Version 1 — Useful local analysis

Release all three packages.

The analysis package detects commands directly inside each function:

```ts
foo(); // discarded call
x = value;
x++;
obj.x = value;
delete obj.x;
```

It also tracks where referenced variables were declared and measures:

```text
line distance
scope distance
function size
```

It distinguishes nearby local mutation from mutation of values declared farther away.

No cross-function propagation yet.

The ESLint plugin provides rules based on these direct commands.

The reporting CLI produces project-wide scores by aggregating those same direct analyses.

So V1 is already a complete usable product.

---

# Version 2 — Call-chain analysis

Keep the same three packages and public architecture.

Enhance `@state-adapt/spaghetti-analysis` so calls to project functions are resolved.

```ts
function a() {
  window.foo = 1;
  window.bar = 2;
}

function b() {
  a();
}
```

`b` receives both commands from `a`.

Each inherited command gets a hop:

```ts
{
  caller: "b",
  callee: "a",
  callLocation: ...,
  definitionLocation: ...,
  distance: ...
}
```

For:

```text
d → c → b → a → command
```

the analysis for `d` contains the original command plus all three hops and accumulated distance.

Handle recursive call graphs without infinite expansion.

Both ESLint and reporting automatically become stronger because they already consume this analysis.

---

# Version 3 — Known mutation APIs

Enhance the shared analysis package with pluggable command recognizers for cases syntax alone cannot identify.

Examples:

```ts
array.push(x)
map.set(k, v)
signal.set(v)
subject.next(v)
store.update(...)
dispatch(...)
```

Organize recognizers separately:

```text
javascript
dom
state-adapt
react
angular
rxjs
redux
```

Each recognizer only answers:

```ts
Does this AST operation represent a command?
If so, what resource does it command?
```

Everything afterward—distance, propagation, scoring—is shared.

Users can also configure custom APIs.

---

# Version 4 — Better scoring and visualizations

Do not change command analysis architecture.

Add configurable scoring:

```text
base score by command kind
+ declaration distance
+ function-call distance
+ scope crossings
+ file crossings
+ same-function spaghetti distance
```

Each inherited command accumulates additional distance/score at every call layer.

Example:

```text
global mutation        100
b → a distance           5
c → b distance           8
d → c distance           4
---------------------------
command score from d    117
```

The reporting package adds visualizations for:

```text
spaghetti hotspots
highest-scoring functions
highest-scoring files
longest command chains
largest command distances
score trends over time
```

---

## One invariant across every version

```text
Function
  ↓
flat array of every command it ultimately causes
  ↓
each command retains its original location
  + complete call path
  + accumulated distance
  + score
```

That shared representation is the foundation. ESLint rules and codebase reporting are just two different consumers of it.
