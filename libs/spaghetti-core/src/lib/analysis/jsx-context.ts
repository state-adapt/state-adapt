import * as ts from 'typescript';
import { isFunction } from './ast';
import { isOuterExpression } from './command-detection';
import { FunctionDraft } from './internal-types';
import { FunctionAnalysis } from './models';

export function stripFunctionDraft(fn: FunctionDraft): FunctionAnalysis {
  return {
    functionId: fn.functionId,
    name: fn.name,
    location: fn.location,
    size: fn.size,
    commands: fn.commands,
    score: fn.score,
    ...(fn.jsxEventHandler ? { jsxEventHandler: true } : {}),
    ...(fn.truncated ? { truncated: true } : {}),
  };
}

export function isJsxEventHandler(node: ts.FunctionLikeDeclaration): boolean {
  let parent: ts.Node | undefined = node.parent;
  while (parent && isOuterExpression(parent)) parent = parent.parent;
  if (!parent || !ts.isJsxExpression(parent) || !ts.isJsxAttribute(parent.parent))
    return false;
  return /^on[A-Z]/.test(parent.parent.name.getText());
}

export function referencedJsxEventHandlers(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
): Set<ts.FunctionLikeDeclaration> {
  const handlers = new Set<ts.FunctionLikeDeclaration>();
  const visit = (node: ts.Node): void => {
    if (
      ts.isJsxAttribute(node) &&
      /^on[A-Z]/.test(node.name.getText()) &&
      node.initializer &&
      ts.isJsxExpression(node.initializer) &&
      node.initializer.expression
    ) {
      const expression = node.initializer.expression;
      const declaration = ts.isIdentifier(expression)
        ? checker.getSymbolAtLocation(expression)?.valueDeclaration
        : undefined;
      const candidate =
        declaration && ts.isVariableDeclaration(declaration)
          ? declaration.initializer
          : declaration;
      if (candidate && isFunction(candidate) && candidate.body) handlers.add(candidate);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return handlers;
}
