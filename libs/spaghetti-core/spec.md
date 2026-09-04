## Architecture

Build three packages/tools.

### `@state-adapt/spaghetti-core`

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

### `@state-adapt/eslint-plugin-spaghetti`

Thin ESLint rules that call `@state-adapt/spaghetti-core`.

Examples:

```text
max-spaghetti-score
max-command-distance
max-commands
no-remote-mutation
```

The ESLint package should not independently implement AST analysis.

### `@state-adapt/spaghetti-analyzer`

CLI/reporting tool that also calls `@state-adapt/spaghetti-core`.

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

Enhance `@state-adapt/spaghetti-core` so calls to project functions are resolved.

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

- Package names, Nx projects, and library directories align: `libs/spaghetti-core` publishes `@state-adapt/spaghetti-core`, `libs/eslint-plugin-spaghetti` publishes `@state-adapt/eslint-plugin-spaghetti`, and `libs/spaghetti-analyzer` publishes `@state-adapt/spaghetti-analyzer`.
- The shared package owns `analyzeFunction`, `analyzeFile`, and `analyzeProject`, plus the public command, distance, declaration, function, file, and project result types.
- Scoring begins with configurable base scores per command kind and configurable line-distance, scope-distance, and function-size weights. Consumer thresholds remain independently configurable.
- ESLint rules and the reporting CLI consume shared analysis results. They do not walk or interpret ASTs themselves; the report exposes both readable text and complete JSON.

---

## Stable V2 decisions

- A call that resolves to a project function contributes that function's actual downstream commands instead of a generic discarded-call command. Calls that cannot be resolved remain direct discarded-call commands.
- Each inherited command keeps its original command location and origin function. Its ordered call path runs from the analyzed caller toward the origin, and each hop records caller, callee, call and definition locations, and line, scope, function-call, and file distance.
- Project analysis resolves lexical same-file calls and named, aliased, default, and namespace calls through relative TypeScript/JavaScript imports. Single-file analysis applies the same propagation to functions available in that file.
- Recursive expansion is bounded by the functions already visited on the current path. Distinct acyclic call paths remain distinct because they represent distinct ways a caller can cause a command.
- Call-chain distance is accumulated onto the command. Function-call and file scoring weights are available with zero defaults, while the broader scoring model remains reserved for V4.
- Call-graph propagation exports effects rather than every implementation command. A mutation of an allocation owned by the callee does not cross that callee's boundary. Parameter-derived effects do cross and are rebound to caller argument provenance before further propagation; shared, captured, class, module, proven-external, and unresolved effects remain exportable.

---

## Stable V3 decisions

- Known APIs produce a single `api-command` carrying stable API and recognizer names; resolved project functions still expand to their downstream commands instead.
- Recognizers only identify the API and resource expression. Shared analysis owns declarations, remoteness, distance, propagation, recursion handling, and score.
- The JavaScript and DOM recognizer families are enabled by default and can be selected individually. Programmatic recognizers run first, followed by JSON-friendly custom patterns and built-ins.
- Custom patterns support method or function calls, optional receiver/import constraints, and receiver- or argument-based resources. The same shape is accepted by ESLint and report CLI configuration.
- V3 adds one configurable `api-command` base score; richer per-API scoring remains V4 work.

---

## Stable V4 decisions

- A command exposes an additive score breakdown containing its base, declaration-line, call, scope-crossing, file-crossing, folder-crossing, same-function, and function-size contributions. API names can override the base for individual known APIs; all bases and weights are JSON-configurable.
- Same-function spaghetti distance is the non-negative line offset from a function's declaration/start line to the command or project-function call site inside it. A direct command contributes its origin offset, and every inherited layer contributes the caller's call-site offset. This stays distinct from command-to-resource declaration distance.
- Inheritance creates a new command and prepends both the hop and that hop's score contributions. Origin commands and their breakdowns are not mutated, and the contribution list provides caller-first evidence for the total.
- Report JSON includes deterministic, top-limited datasets for command hotspots, functions, files, call-chain lengths, and aggregate command distances. Text output renders the same data with dependency-free tables/bars.
- Score trends consume an optional JSON-friendly array of `{ label, score, timestamp? }` historical snapshots and append the current analysis with per-point deltas. History is caller-owned input; analysis and reporting perform no hidden persistence.

---

## Recognizer precedence refinement

- General syntax detection takes precedence over API-specific recognition. Bare call statements, including awaited or syntax-wrapped calls, are `discarded-call` commands without consulting recognizers.
- API-specific, custom, and programmatic recognizers are fallbacks only for imperative calls embedded in value-producing contexts that the general statement rule would otherwise miss.
- Built-in fallbacks are limited to JavaScript and DOM mutation APIs with usable return values.

---

## Recognizer return-value audit

- A built-in API recognizer exists only when a mutation returns a value that can realistically participate in an initializer, return, argument, condition, or other value context. Bare calls are already covered by general discarded-call detection.
- JavaScript retains mutating Array methods and the value-returning Map/Set methods `add`, `delete`, and `set`. `clear` is omitted because it returns `void`.
- DOM retains `appendChild`, `insertAdjacentElement`, `removeChild`, `replaceChild`, and `toggleAttribute`, plus `DOMTokenList.replace` and `DOMTokenList.toggle`. Other previously listed DOM mutations return `void`.

---

## Type-aware and project-wide analysis decisions

- Type-aware analysis is required. Analysis uses a reusable TypeScript program and checker, and a concise arrow body whose expression is definitely `void` is a command.
- Cross-file analysis is enabled by default with an explicit opt-out. It resolves the project graph and accumulates call, scope, file, and folder crossings without rebuilding the program per file. Folder distance counts directory edges between caller and callee; file- and folder-crossing weights are independently configurable.
- ESLint reuses and caches the parser's TypeScript program and project graph. Call-path expansion is bounded, and incomplete results are surfaced rather than silently treated as complete.
- JSX attributes named like events (`on` followed by an uppercase letter) receive an allowance for one over-threshold imperative command. Handlers may be concise, multiline, or block-bodied.

---

## Unified ESLint policy decisions

- Aggregate function, file, and project scores remain analyzer concerns. ESLint reports individual command or caller lines.
- The ESLint plugin exposes one primary `no-spaghetti` rule instead of independently enforcing maximum score, command count, command distance, and remote mutation.
- `no-spaghetti` assesses each command using configurable declaration-line, scope, file, and folder weights. `maxScore` is the maximum aggregate command score allowed and defaults to `6`. It does not use aggregate function scores, fixed call penalties, or function-size penalties.
- Generic method calls use their receiver as the resource when possible. Calls without a resolvable implementation or resource receive a configurable external-call penalty.
- Unresolved external commands receive a numeric penalty of `100` by default; explicit API and call allowlists take precedence.
- JSX event handlers receive one allowance for an over-threshold command. Subsequent over-threshold commands are reported normally; allowlisted commands do not consume the allowance.
- API-specific and consumer-configured recognizers only improve command and resource detection; they do not create separate lint policies.

---

## Trace-based ESLint scoring defaults

- Command scores model the effort required to trace cause and effect: declaration-line distance and lexical scope crossings default to `1`, file crossings to `30`, directory edges to `15`, and unresolved external commands to `100`.
- Resolved calls extend the trace. Same-file calls accumulate call-to-declaration line distance; cross-file calls accumulate file and folder crossings. Calls have no fixed score merely for existing.
- Direct references to resources in other analyzed files use the same file and folder units as resolved calls. Only unresolved targets and resources outside the analyzed program receive the external penalty.
- `maxScore` defaults to `6`; equal scores are allowed and higher scores are reported.
- ESLint scoring stops once a command is known to exceed `maxScore`. Without configured allowlists, call-chain expansion stops at any call boundary that already exceeds the limit; full call-chain scoring remains available to the analyzer.
- JavaScript and DOM are the only built-in API recognizer families. Redux support belongs outside this plugin.
