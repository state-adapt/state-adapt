import * as ts from 'typescript';
import { FunctionAnalysis } from './models';
import { FunctionDraft } from './internal-types';
import { isFunction } from './ast';
import { isOuterExpression } from './command-detection';

export function stripFunctionDraft(fn: FunctionDraft): FunctionAnalysis {
  return {
    functionId: fn.functionId,
    name: fn.name,
    location: fn.location,
    size: fn.size,
    commands: fn.commands,
    score: fn.score,
    ...(fn.truncated ? { truncated: true } : {}),
  };
}

export function applyJsxEventHandlerAllowance(fn: FunctionDraft): void {
  if (!fn.jsxEventHandler || fn.commands.length === 0) return;
  const highest = fn.commands.reduce((left, right) =>
    right.score > left.score ? right : left,
  );
  highest.allowed = 'jsx-event-handler';
}

export function isJsxEventHandler(node: ts.FunctionLikeDeclaration): boolean {
  let parent: ts.Node | undefined = node.parent;
  while (parent && isOuterExpression(parent)) parent = parent.parent;
  if (!parent || !ts.isJsxExpression(parent) || !ts.isJsxAttribute(parent.parent))
    return false;
  return /^on[A-Z]/.test(parent.parent.name.getText());
}

export function enclosingFunction(node: ts.Node): ts.FunctionLikeDeclaration | undefined {
  let current: ts.Node | undefined = node;
  while (current) {
    if (isFunction(current)) return current;
    current = current.parent;
  }
  return undefined;
}
