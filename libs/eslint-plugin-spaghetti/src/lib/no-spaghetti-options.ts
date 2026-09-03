/**
 * Use this pattern for commands called as methods, such as `cache.write()`.
 * The method receiver can be treated as the affected resource.
 */
export interface NoSpaghettiMethodApiPattern {
  /** Names the pattern so it can be referenced by `allowedApis`. */
  name: string;
  /** Lists command method names, such as `write` in `cache.write()`. */
  methods: string[];
  functions?: never;
  /** Restricts method calls by receiver name, such as `cache` in `cache.write()`. */
  receiverNames?: string[];
  /** Restricts recognition to APIs imported from these module specifiers. */
  importSources?: string[];
  /** Selects the receiver or argument used to calculate the command score. */
  resource?: 'receiver' | 'argument';
  /** Selects the argument used to calculate the command score. `0` means the first argument. */
  argumentIndex?: number;
}

/**
 * Use this pattern for standalone command functions, such as `writeCache(cache)`.
 * One of the function arguments is treated as the affected resource.
 */
export interface NoSpaghettiFunctionApiPattern {
  /** Names the pattern so it can be referenced by `allowedApis`. */
  name: string;
  /** Lists command function names, such as `writeCache` in `writeCache(cache)`. */
  functions: string[];
  methods?: never;
  /** Restricts recognition to APIs imported from these module specifiers. */
  importSources?: string[];
  /** Uses the selected argument or imported callee to calculate the command score. */
  resource?: 'argument' | 'callee';
  /** Selects the argument used to calculate the command score. `0` means the first argument. */
  argumentIndex?: number;
}

/**
 * Configures how the rule recognizes commands from a project-specific API.
 *
 * This is a union because method calls and standalone function calls identify
 * their affected resources differently. Choose the shape that matches the API:
 *
 * - For `receiver.method()` calls, use {@link NoSpaghettiMethodApiPattern}.
 * - For standalone `function()` calls, use {@link NoSpaghettiFunctionApiPattern}.
 *
 * A pattern never uses both `methods` and `functions`.
 *
 * @example Receiver and argument resources
 * Both calls below modify `cache`, but they pass it to the API differently:
 *
 * ```ts
 * import { cache, writeCache } from 'cache-library';
 *
 * cache.write(value); // `cache` is the method receiver.
 * writeCache(cache, value); // `cache` is the first argument.
 * ```
 *
 * This configuration in `.eslintrc.json` tells the rule to use `cache` when
 * calculating the score of either command:
 *
 * ```json
 * {
 *   "rules": {
 *     "@state-adapt/spaghetti/no-spaghetti": [
 *       "warn",
 *       {
 *         "apiPatterns": [
 *           {
 *             "name": "cache.methodWrite",
 *             "methods": ["write"],
 *             "receiverNames": ["cache"],
 *             "importSources": ["cache-library"],
 *             "resource": "receiver"
 *           },
 *           {
 *             "name": "cache.functionWrite",
 *             "functions": ["writeCache"],
 *             "importSources": ["cache-library"],
 *             "resource": "argument",
 *             "argumentIndex": 0
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * }
 * ```
 */
export type NoSpaghettiApiPattern =
  | NoSpaghettiMethodApiPattern
  | NoSpaghettiFunctionApiPattern;

/**
 * Configures which commands the `@state-adapt/spaghetti/no-spaghetti` rule reports
 * and how it calculates each command's score.
 *
 * @example Apply a command policy
 * A command is allowed when its aggregate score is at most `maxScore`; a higher
 * score produces a warning. In `.eslintrc.json`, the default policy is:
 *
 * ```json
 * {
 *   "rules": {
 *     "@state-adapt/spaghetti/no-spaghetti": [
 *       "warn",
 *       {
 *         "maxScore": 6,
 *         "declarationLineDistanceWeight": 1,
 *         "scopeWeight": 1,
 *         "fileWeight": 30,
 *         "folderWeight": 15,
 *         "externalPenalty": 100
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * Each measured count is multiplied by its weight. This configuration penalizes
 * file and folder crossings more heavily because they require more navigation than
 * nearby code. Resolved calls extend the trace instead of adding a fixed call cost.
 *
 * ```ts
 * function save(draft: { saved: boolean }): void {
 *   draft.saved = true;
 * }
 * ```
 *
 * Here the resource declaration is one line from the command, so its score is
 * `1 × 1 = 1` and it is allowed. A resolved call to a command in another file
 * or a direct reference to a resource in another file receives at least
 * `1 × 30 = 30`, so it is reported unless explicitly allowlisted.
 */
export interface NoSpaghettiOptions {
  /**
   * Sets the greatest aggregate command score allowed without a warning. A score
   * equal to this value is allowed; a higher score is reported. Defaults to `6`.
   */
  maxScore?: number;
  /**
   * Multiplies the source-line distance from a command to the declaration it
   * mutates. For resolved calls in the same file, it also multiplies the line
   * distance from each call site to the called function's declaration. Lines 1 and
   * 7 are six line-distance units. Defaults to `1` point per unit.
   */
  declarationLineDistanceWeight?: number;
  /**
   * Multiplies the number of lexical scope boundaries crossed while tracing a
   * command to the declaration it mutates or a call to the function it resolves.
   * Counts accumulate along a resolved call chain. Defaults to `1` point per scope.
   */
  scopeWeight?: number;
  /**
   * Multiplies the number of trace edges that cross file boundaries. A resolved
   * call or imported resource in another analyzed file counts once, regardless of
   * directory depth. Defaults to `30` points per crossing.
   */
  fileWeight?: number;
  /**
   * Multiplies the number of directory edges between caller and callee files on a
   * cross-file trace edge. A call or resource reference from
   * `src/a/example.ts` to `src/b/example.ts` crosses two edges: one up to `src`,
   * then one down to `b`. Defaults to `15` points per edge.
   */
  folderWeight?: number;
  /**
   * Sets the penalty added when a command's affected resource or implementation
   * cannot be resolved inside the analyzed TypeScript program. Imports resolved to
   * another analyzed file use file and folder weights instead.
   * Intentional exceptions should use `allowedCalls` or `allowedApis`. Defaults to
   * `100`.
   */
  externalPenalty?: number;
  /**
   * Lists exact source-level call names that never produce warnings, regardless of
   * score. For example, `"console.log"` matches `console.log()`. Defaults to an
   * empty list.
   */
  allowedCalls?: string[];
  /**
   * Lists additional recognized API names that never produce warnings, regardless
   * of score. The rule includes import-aware defaults for common Angular, React,
   * Vue, Svelte, Solid, and Preact application entry points.
   */
  allowedApis?: string[];
  /**
   * Determines whether a command found in another file is propagated back
   * through a resolved call and assessed at the caller. Setting this to `false`
   * retains direct-command and same-file analysis. Defaults to `true`.
   */
  crossFileAnalysis?: boolean;
  /**
   * Prevents recursive or cyclic call analysis from expanding without bound. Sets
   * the maximum number of resolved call hops followed from each function; longer
   * paths are omitted and reported as truncated. Defaults to `50` hops.
   */
  maxCallDepth?: number;
  /**
   * Prevents unbounded or combinatorial command-path expansion. Sets the maximum
   * number of direct and inherited command paths retained for each function;
   * additional paths are omitted and reported as truncated. Defaults to `10,000`.
   */
  maxCommandsPerFunction?: number;
  /**
   * Defines project-specific call patterns that should be recognized as commands
   * when general command detection would otherwise miss them. Each pattern also
   * identifies the affected resource used to calculate the score. Defaults to an
   * empty list.
   */
  apiPatterns?: NoSpaghettiApiPattern[];
  /**
   * Selects the API-specific recognizer families used in addition to general
   * command detection. JavaScript collection and DOM mutation recognizers are
   * enabled by default; an empty list disables both.
   */
  builtInRecognizers?: Array<'javascript' | 'dom'>;
}
