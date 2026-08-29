import * as ts from 'typescript';
import { Declaration } from './models';
import { isFunction, locationOf } from './ast';

export interface Scope {
  parent?: Scope;
  declarations: Map<string, Declaration>;
}

export function buildScopes(
  node: ts.Node,
  current: Scope,
  scopes: Map<ts.Node, Scope>,
  sourceFile: ts.SourceFile,
): void {
  const createsScope =
    node !== sourceFile &&
    (isFunction(node) ||
      (ts.isBlock(node) && !isFunction(node.parent)) ||
      ts.isCatchClause(node));
  if (createsScope && ts.isFunctionDeclaration(node) && node.name)
    addDeclaration(node.name.text, 'function', node.name, current, sourceFile);
  const scope: Scope = createsScope
    ? { parent: current, declarations: new Map() }
    : current;
  scopes.set(node, scope);
  if (!(createsScope && ts.isFunctionDeclaration(node)))
    registerDeclaration(node, scope, sourceFile);
  ts.forEachChild(node, child => buildScopes(child, scope, scopes, sourceFile));
}

function registerDeclaration(
  node: ts.Node,
  scope: Scope,
  sourceFile: ts.SourceFile,
): void {
  if (ts.isVariableDeclaration(node))
    registerBinding(node.name, 'variable', node, scope, sourceFile);
  else if (ts.isParameter(node))
    registerBinding(node.name, 'parameter', node, scope, sourceFile);
  else if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) && node.name)
    addDeclaration(
      node.name.text,
      ts.isClassDeclaration(node) ? 'class' : 'function',
      node.name,
      scope,
      sourceFile,
    );
  else if (ts.isImportClause(node) && node.name)
    addDeclaration(node.name.text, 'import', node.name, scope, sourceFile);
  else if (ts.isImportSpecifier(node))
    addDeclaration(node.name.text, 'import', node.name, scope, sourceFile);
  else if (ts.isNamespaceImport(node))
    addDeclaration(node.name.text, 'import', node.name, scope, sourceFile);
}

function registerBinding(
  name: ts.BindingName,
  kind: Declaration['kind'],
  node: ts.Node,
  scope: Scope,
  sourceFile: ts.SourceFile,
): void {
  if (ts.isIdentifier(name)) addDeclaration(name.text, kind, node, scope, sourceFile);
  else
    name.elements.forEach(element => {
      if (ts.isBindingElement(element))
        registerBinding(element.name, kind, element, scope, sourceFile);
    });
}

function addDeclaration(
  name: string,
  kind: Declaration['kind'],
  node: ts.Node,
  scope: Scope,
  sourceFile: ts.SourceFile,
): void {
  scope.declarations.set(name, { name, kind, location: locationOf(node, sourceFile) });
}

export function resolveDeclaration(
  name: string,
  start?: Scope,
): { declaration: Declaration; scopeDistance: number } | undefined {
  let scope = start;
  let scopeDistance = 0;
  while (scope) {
    const declaration = scope.declarations.get(name);
    if (declaration) return { declaration, scopeDistance };
    scope = scope.parent;
    scopeDistance += 1;
  }
  return undefined;
}

export function resourceName(expression?: ts.Expression): string | undefined {
  if (!expression) return undefined;
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression))
    return resourceName(expression.expression);
  if (ts.isElementAccessExpression(expression))
    return resourceName(expression.expression);
  if (ts.isParenthesizedExpression(expression))
    return resourceName(expression.expression);
  return undefined;
}
