import * as ts from 'typescript';

export type BuiltInRecognizerName = 'javascript' | 'dom' | 'redux';

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

export type ApiPatternResource = 'receiver' | 'argument';

/**
 * JSON-friendly custom recognition. `methods` matches property calls and
 * `functions` matches identifier calls. Optional receiver/import constraints
 * reduce false positives. Exactly one of `methods` or `functions` is required.
 */
interface ApiCommandPatternBase {
  name: string;
  receiverNames?: string[];
  importSources?: string[];
  resource?: ApiPatternResource;
  argumentIndex?: number;
}

export type ApiCommandPattern = ApiCommandPatternBase &
  ({ methods: string[]; functions?: never } | { functions: string[]; methods?: never });
