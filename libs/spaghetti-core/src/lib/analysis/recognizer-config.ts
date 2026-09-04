import * as ts from 'typescript';
import { AnalysisOptions } from './models';
import { ImportBinding } from './internal-types';
import { Scope, resolveDeclaration } from './scopes';
import { locationOf } from './ast';
import { locationStartKey } from './scoring';
import {
  BuiltInRecognizerName,
  CommandRecognitionContext,
  CommandRecognizer,
  builtInRecognizers,
  frameworkApiNames,
} from '../recognizers';
import { ApiPatternDefinition, patternRecognizer } from '../recognizers/utils';

export interface NormalizedApiConfiguration {
  patterns: ApiPatternDefinition[];
  penalties: ReadonlyMap<string, number>;
}

const configurations = new WeakMap<AnalysisOptions, NormalizedApiConfiguration>();

export function apiConfiguration(options: AnalysisOptions): NormalizedApiConfiguration {
  const cached = configurations.get(options);
  if (cached) return cached;
  const penalties = new Map<string, number>(
    frameworkApiNames.map(name => [name, 0] as const),
  );
  const patterns: ApiPatternDefinition[] = [];
  for (const api of options.apis ?? []) {
    if (api.penalty !== undefined) penalties.set(api.name, api.penalty);
    if (api.methods || api.functions || api.calls) patterns.push(api);
  }
  const configuration = { patterns, penalties };
  configurations.set(options, configuration);
  return configuration;
}

export function configuredRecognizers(
  options: AnalysisOptions,
): readonly CommandRecognizer[] {
  const enabled = options.builtInRecognizers
    ? new Set(options.builtInRecognizers)
    : undefined;
  return [
    ...(options.recognizers ?? []),
    ...apiConfiguration(options).patterns.map(patternRecognizer),
    ...builtInRecognizers.filter(
      recognizer => !enabled || enabled.has(recognizer.name as BuiltInRecognizerName),
    ),
  ];
}

export function createRecognitionContext(
  sourceFile: ts.SourceFile,
  imports: Map<string, ImportBinding>,
  scopes: Map<ts.Node, Scope>,
): CommandRecognitionContext {
  return {
    sourceFile,
    importSource(localName) {
      return imports.get(localName)?.moduleName;
    },
    importedName(localName) {
      return imports.get(localName)?.importedName;
    },
    declarationInitializer(name, from) {
      const resolution = resolveDeclaration(name, scopes.get(from));
      if (!resolution) return undefined;
      const declarationStart = locationStartKey(resolution.declaration.location);
      let initializer: ts.Expression | undefined;
      const visit = (node: ts.Node): void => {
        if (initializer) return;
        if (ts.isVariableDeclaration(node) && node.initializer) {
          const declarationNode = bindingDeclarationNode(node.name, name, node);
          if (
            declarationNode &&
            locationStartKey(locationOf(declarationNode, sourceFile)) === declarationStart
          )
            initializer = node.initializer;
        }
        ts.forEachChild(node, visit);
      };
      visit(sourceFile);
      return initializer;
    },
  };
}

function bindingDeclarationNode(
  binding: ts.BindingName,
  name: string,
  declarationNode: ts.Node,
): ts.Node | undefined {
  if (ts.isIdentifier(binding))
    return binding.text === name ? declarationNode : undefined;
  for (const element of binding.elements) {
    if (!ts.isBindingElement(element)) continue;
    const found = bindingDeclarationNode(element.name, name, element);
    if (found) return found;
  }
  return undefined;
}

export function exportedName(sourceFile: ts.SourceFile, exported: string): string {
  for (const statement of sourceFile.statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      !statement.exportClause ||
      !ts.isNamedExports(statement.exportClause)
    )
      continue;
    const match = statement.exportClause.elements.find(
      element => element.name.text === exported,
    );
    if (match) return match.propertyName?.text ?? match.name.text;
  }
  return exported;
}

export function defaultExportName(sourceFile: ts.SourceFile): string | undefined {
  for (const statement of sourceFile.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name &&
      hasModifier(statement, ts.SyntaxKind.DefaultKeyword)
    )
      return statement.name.text;
    if (ts.isExportAssignment(statement) && ts.isIdentifier(statement.expression))
      return statement.expression.text;
  }
  return undefined;
}

export function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return Boolean(
    ts.getModifiers(node as ts.HasModifiers)?.some(modifier => modifier.kind === kind),
  );
}
