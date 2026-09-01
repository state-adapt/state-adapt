import * as path from 'node:path';
import * as ts from 'typescript';
import { Declaration, Distance } from './models';
import { locationOf } from './ast';
import { folderDistance } from './call-resolution';
import { resolveDeclaration, Scope } from './scopes';

export interface ResolvedResource {
  name: string;
  declaration?: Declaration;
  distance: Pick<Distance, 'declarationLine' | 'scope' | 'file' | 'folder'>;
  external: boolean;
}

export function resolveResource(
  target: ts.Expression,
  from: ts.Node,
  sourceFile: ts.SourceFile,
  scopes: Map<ts.Node, Scope>,
  checker: ts.TypeChecker,
  analyzedFiles: ReadonlySet<ts.SourceFile>,
): ResolvedResource {
  const identifier = resourceIdentifier(target);
  const name = identifier?.text ?? target.getText(sourceFile);
  const local = identifier
    ? resolveDeclaration(identifier.text, scopes.get(from))
    : undefined;
  const declarationNode = identifier
    ? projectDeclaration(identifier, checker, analyzedFiles)
    : undefined;
  const declaration = declarationNode
    ? declarationFrom(declarationNode, identifier?.text ?? name)
    : local?.declaration.kind === 'import'
    ? undefined
    : local?.declaration;
  const declarationFile = declarationNode?.getSourceFile();
  const sameFile = !declarationFile || declarationFile === sourceFile;
  return {
    name,
    ...(declaration ? { declaration } : {}),
    distance: {
      declarationLine:
        declaration && sameFile
          ? Math.abs(
              locationOf(from, sourceFile).start.line - declaration.location.start.line,
            )
          : 0,
      scope: local?.scopeDistance ?? 0,
      file: declarationFile && !sameFile ? 1 : 0,
      folder:
        declarationFile && !sameFile
          ? folderDistance(
              path.dirname(path.resolve(sourceFile.fileName)),
              path.dirname(path.resolve(declarationFile.fileName)),
            )
          : 0,
    },
    external: !declaration,
  };
}

function resourceIdentifier(expression: ts.Expression): ts.Identifier | undefined {
  if (ts.isIdentifier(expression)) return expression;
  if (ts.isPropertyAccessExpression(expression)) {
    if (
      expression.expression.kind === ts.SyntaxKind.ThisKeyword &&
      ts.isIdentifier(expression.name)
    )
      return expression.name;
    return resourceIdentifier(expression.expression);
  }
  if (ts.isElementAccessExpression(expression))
    return resourceIdentifier(expression.expression);
  if (ts.isParenthesizedExpression(expression))
    return resourceIdentifier(expression.expression);
  return undefined;
}

function projectDeclaration(
  identifier: ts.Identifier,
  checker: ts.TypeChecker,
  analyzedFiles: ReadonlySet<ts.SourceFile>,
): ts.Declaration | undefined {
  let symbol = checker.getSymbolAtLocation(identifier);
  if (!symbol) return undefined;
  if (symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
  return [symbol.valueDeclaration, ...(symbol.declarations ?? [])].find(
    declaration =>
      declaration !== undefined &&
      !declaration.getSourceFile().isDeclarationFile &&
      analyzedFiles.has(declaration.getSourceFile()),
  );
}

function declarationFrom(node: ts.Declaration, name: string): Declaration {
  return {
    name: declarationName(node) ?? name,
    kind: declarationKind(node),
    location: locationOf(node, node.getSourceFile()),
  };
}

function declarationName(node: ts.Declaration): string | undefined {
  const named = node as ts.NamedDeclaration;
  return named.name && ts.isIdentifier(named.name) ? named.name.text : undefined;
}

function declarationKind(node: ts.Declaration): Declaration['kind'] {
  if (ts.isParameter(node)) return 'parameter';
  if (ts.isFunctionLike(node)) return 'function';
  if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) return 'class';
  if (ts.isImportSpecifier(node) || ts.isImportClause(node) || ts.isNamespaceImport(node))
    return 'import';
  if (ts.isVariableDeclaration(node) || ts.isPropertyDeclaration(node)) return 'variable';
  return 'unknown';
}
