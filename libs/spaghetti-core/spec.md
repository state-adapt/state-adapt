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

Alright, now here is a description of what I would like to build. Feel free to use subagents if useful. Notice that instead of calling it imperative analysis, I'm calling it a spaghetti. Because imperative doesn't distinguish between distance, but a lot of what I want to analyze is stuff that's messing with stuff from far away, as you'll see in this description. So that's why I'm calling it spaghetti. Now the one thing this does not describe is event handlers in JSX and Angular templates. There may need to be separate packages for both of those situations. But basically, the rule should be in those situations that the event handler function should be inline and basically One imperative statement is allowed because it's simply unavoidable in current frameworks. Anyway, here it is. There may not be enough detail here to implement it all the way. Feel free to ask any clarifying question. But I'm interested in what you can do with this.

It's important to have tests for the ESLint plugin that include a variety of examples.

I have checked out a branch called Spaghetti and feel free to commit once you have completed each version, following the conventional commits pattern we've been following in this repo.

Actually, it would be good for you to take on sort of a project manager role and spin up a different developer sub-agent to work on each version.

Keep in mind that the various weights and scores should be configurable.

Okay, actually I pasted the description of what needs to be built inside this file. libs/spaghetti-core/spec.md
And I have committed the work done up to now.

---

## Stable V1 decisions

- The initial scaffold directories remain in place to preserve workspace history, while their public packages follow this specification: `libs/spaghetti-core` publishes `@state-adapt/spaghetti-analysis`, `libs/eslint-plugin-spaghetti` publishes `eslint-plugin-state-adapt`, and `libs/spaghetti-analyzer` publishes `state-adapt-spaghetti-report`.
- The shared package owns `analyzeFunction`, `analyzeFile`, and `analyzeProject`, plus the public command, distance, declaration, function, file, and project result types. V1 command paths are empty and call/file distances are zero, leaving the result shape forward-compatible with call-chain analysis.
- Scoring begins with configurable base scores per command kind and configurable line-distance, scope-distance, and function-size weights. Consumer thresholds remain independently configurable.
- ESLint rules and the reporting CLI consume shared analysis results. They do not walk or interpret ASTs themselves; the report exposes both readable text and complete JSON.

---

## Stable V2 decisions

- A call that resolves to a project function contributes that function's actual downstream commands instead of a generic discarded-call command. Calls that cannot be resolved remain direct discarded-call commands.
- Each inherited command keeps its original command location and origin function. Its ordered call path runs from the analyzed caller toward the origin, and each hop records caller, callee, call and definition locations, and line, scope, function-call, and file distance.
- Project analysis resolves lexical same-file calls and named, aliased, default, and namespace calls through relative TypeScript/JavaScript imports. Single-file analysis applies the same propagation to functions available in that file.
- Recursive expansion is bounded by the functions already visited on the current path. Distinct acyclic call paths remain distinct because they represent distinct ways a caller can cause a command.
- Call-chain distance is accumulated onto the command. Function-call and file scoring weights are available with zero defaults, while the broader scoring model remains reserved for V4.
