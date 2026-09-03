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

export type ApiPatternResource = 'receiver' | 'argument' | 'callee';

/**
 * JSON-friendly custom recognition. `methods` matches property calls,
 * `functions` matches identifier calls, and `calls` matches exact source-level
 * names. Optional receiver/import constraints reduce false positives.
 */
interface ApiCommandPatternBase {
  name: string;
  importSources?: string[];
  argumentIndex?: number;
}

export type ApiCommandPattern =
  | (ApiCommandPatternBase & {
      methods: string[];
      functions?: never;
      calls?: never;
      receiverNames?: string[];
      resource?: ApiPatternResource;
    })
  | (ApiCommandPatternBase & {
      functions: string[];
      methods?: never;
      calls?: never;
      resource?: 'argument' | 'callee';
    })
  | (ApiCommandPatternBase & {
      calls: string[];
      methods?: never;
      functions?: never;
      receiverNames?: never;
      importSources?: never;
      argumentIndex?: never;
      resource?: never;
    });
