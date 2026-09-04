import * as ts from 'typescript';

export type BuiltInRecognizerName = 'javascript' | 'dom' | 'framework';

export interface RecognizedApiCommand {
  /** A stable, human-readable API identifier, such as `Array.push`. */
  api: string;
  /** The expression whose declaration and distance should be analyzed. */
  resource: ts.Expression;
}

export interface CommandRecognitionContext {
  sourceFile: ts.SourceFile;
  /** Returns the module specifier for an imported local identifier. */
  importSource(localName: string): string | undefined;
  /** Returns the original exported name for an imported local identifier. */
  importedName(localName: string): string | undefined;
  /** Finds a visible syntactic initializer without requiring a type checker. */
  declarationInitializer(name: string, from: ts.Node): ts.Expression | undefined;
}

export interface CommandRecognizer {
  readonly name: string;
  recognize(
    call: ts.CallExpression,
    context: CommandRecognitionContext,
  ): RecognizedApiCommand | undefined;
}

interface ApiDefinitionBase {
  /** Stable name used to identify the API. */
  name: string;
  /**
   * Sets the command leaf's starting penalty. Distance costs remain additive.
   * Zero discards the command immediately; omit this to use ordinary scoring.
   */
  penalty?: number;
}

/** Recognizes commands called as methods, such as `cache.write()`. */
export interface MethodApiDefinition extends ApiDefinitionBase {
  /** Method names to recognize, such as `write` in `cache.write()`. */
  methods: string[];
  functions?: never;
  calls?: never;
  /** Optional receiver names that restrict the match. */
  receiverNames?: string[];
  /** Optional module specifiers that restrict the match. */
  importSources?: string[];
  /** The receiver or selected argument whose declaration determines distance. */
  resource?: 'receiver' | 'argument';
  /** Zero-based argument used when `resource` is `argument`. */
  argumentIndex?: number;
}

/** Recognizes standalone command functions, such as `writeCache(cache)`. */
export interface FunctionApiDefinition extends ApiDefinitionBase {
  /** Function names to recognize, such as `writeCache`. */
  functions: string[];
  methods?: never;
  calls?: never;
  /** Optional module specifiers that restrict the match. */
  importSources?: string[];
  /** The selected argument or imported callee whose declaration determines distance. */
  resource?: 'argument' | 'callee';
  /** Zero-based argument used when `resource` is `argument`. */
  argumentIndex?: number;
}

/** Recognizes an API by its exact source-level call name. */
export interface CallApiDefinition extends ApiDefinitionBase {
  /** Exact source-level call names, such as `console.log`. */
  calls: string[];
  methods?: never;
  functions?: never;
  receiverNames?: never;
  importSources?: never;
  resource?: never;
  argumentIndex?: never;
}

/** Assigns a penalty to an API recognized by a built-in recognizer. */
export interface RecognizedApiDefinition extends ApiDefinitionBase {
  penalty: number;
  methods?: never;
  functions?: never;
  calls?: never;
  receiverNames?: never;
  importSources?: never;
  resource?: never;
  argumentIndex?: never;
}

/**
 * Configures JSON-friendly API recognition and leaf penalties. A definition
 * recognizes methods, standalone functions, or exact source-level calls. A
 * name-and-penalty definition changes the penalty of a built-in API.
 *
 * A definition never combines `methods`, `functions`, or `calls`.
 *
 * @example Receiver and argument resources
 * These calls both modify `cache`, but expose it differently:
 *
 * ```ts
 * cache.write(value);
 * writeCache(cache, value);
 * ```
 *
 * ```json
 * {
 *   "apis": [
 *     {
 *       "name": "Cache.write",
 *       "methods": ["write"],
 *       "receiverNames": ["cache"],
 *       "resource": "receiver"
 *     },
 *     {
 *       "name": "Cache.writeFunction",
 *       "functions": ["writeCache"],
 *       "resource": "argument",
 *       "argumentIndex": 0,
 *       "penalty": 5
 *     }
 *   ]
 * }
 * ```
 */
export type ApiDefinition =
  | MethodApiDefinition
  | FunctionApiDefinition
  | CallApiDefinition
  | RecognizedApiDefinition;
