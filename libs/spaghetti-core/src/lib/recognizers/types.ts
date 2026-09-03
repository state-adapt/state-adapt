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
 * JSON-friendly custom recognition. `methods` matches property calls and
 * `functions` matches identifier calls. Optional receiver/import constraints
 * reduce false positives. Exactly one of `methods` or `functions` is required.
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
      receiverNames?: string[];
      resource?: ApiPatternResource;
    })
  | (ApiCommandPatternBase & {
      functions: string[];
      methods?: never;
      resource?: 'argument' | 'callee';
    });
