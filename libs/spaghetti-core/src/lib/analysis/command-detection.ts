import * as ts from 'typescript';
import { CommandKind, SourceLocation } from './models';
import { hasModifier } from './recognizer-config';
import { CommandRecognitionContext, CommandRecognizer } from '../recognizers';
import { isAssignmentOperator, locationOf } from './ast';

export function detectCommand(
  node: ts.Node,
  recognizers: readonly CommandRecognizer[],
  context: CommandRecognitionContext,
  checker: ts.TypeChecker,
  owner: ts.FunctionLikeDeclaration,
):
  | {
      kind: CommandKind;
      target?: ts.Expression;
      api?: string;
      recognizer?: string;
    }
  | undefined {
  if (
    ts.isArrowFunction(owner) &&
    !hasModifier(owner, ts.SyntaxKind.AsyncKeyword) &&
    !ts.isBlock(owner.body) &&
    node === unwrapOuterExpression(owner.body) &&
    ts.isCallExpression(node) &&
    isDefinitelyVoid(checker.getTypeAtLocation(node))
  )
    return { kind: 'discarded-call' };
  if (ts.isExpressionStatement(node)) {
    const outerExpression = unwrapOuterExpression(node.expression);
    const expression = ts.isAwaitExpression(outerExpression)
      ? unwrapOuterExpression(outerExpression.expression)
      : outerExpression;
    if (ts.isCallExpression(expression)) return { kind: 'discarded-call' };
  }
  if (ts.isCallExpression(node) && !isDiscardedCall(node)) {
    const recognized = recognizeApiCommand(node, recognizers, context);
    if (recognized)
      return {
        kind: 'api-command',
        target: recognized.command.resource,
        api: recognized.command.api,
        recognizer: recognized.recognizer,
      };
  }
  if (ts.isBinaryExpression(node) && isAssignmentOperator(node.operatorToken.kind))
    return {
      kind:
        ts.isPropertyAccessExpression(node.left) ||
        ts.isElementAccessExpression(node.left)
          ? 'property-assignment'
          : 'assignment',
      target: node.left,
    };
  if (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) {
    if (node.operator === ts.SyntaxKind.PlusPlusToken)
      return { kind: 'increment', target: node.operand };
    if (node.operator === ts.SyntaxKind.MinusMinusToken)
      return { kind: 'decrement', target: node.operand };
  }
  if (
    ts.isDeleteExpression(node) &&
    (ts.isPropertyAccessExpression(node.expression) ||
      ts.isElementAccessExpression(node.expression))
  )
    return { kind: 'delete', target: node.expression };
  return undefined;
}

function isDiscardedCall(call: ts.CallExpression): boolean {
  let expression: ts.Expression = call;
  while (
    isOuterExpression(expression.parent) &&
    expression.parent.expression === expression
  )
    expression = expression.parent;
  if (ts.isAwaitExpression(expression.parent)) {
    expression = expression.parent;
    while (
      isOuterExpression(expression.parent) &&
      expression.parent.expression === expression
    )
      expression = expression.parent;
  }
  return ts.isExpressionStatement(expression.parent);
}

function isDefinitelyVoid(type: ts.Type): boolean {
  if (type.isUnion()) return type.types.length > 0 && type.types.every(isDefinitelyVoid);
  return (type.flags & (ts.TypeFlags.Void | ts.TypeFlags.Undefined)) !== 0;
}

function unwrapOuterExpression(expression: ts.Expression): ts.Expression {
  let unwrapped = expression;
  while (isOuterExpression(unwrapped)) unwrapped = unwrapped.expression;
  return unwrapped;
}

export function isOuterExpression(
  node: ts.Node,
): node is
  | ts.ParenthesizedExpression
  | ts.AsExpression
  | ts.TypeAssertion
  | ts.NonNullExpression
  | ts.SatisfiesExpression
  | ts.PartiallyEmittedExpression {
  return (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isPartiallyEmittedExpression(node)
  );
}

function recognizeApiCommand(
  call: ts.CallExpression,
  recognizers: readonly CommandRecognizer[],
  context: CommandRecognitionContext,
): { recognizer: string; command: { api: string; resource: ts.Expression } } | undefined {
  for (const recognizer of recognizers) {
    const command = recognizer.recognize(call, context);
    if (command) return { recognizer: recognizer.name, command };
  }
  return undefined;
}

export function callTarget(
  expression: ts.LeftHandSideExpression,
): { name: string; namespace?: string } | undefined {
  const unwrapped = unwrapOuterExpression(expression as ts.Expression);
  if (unwrapped !== expression) return callTarget(unwrapped as ts.LeftHandSideExpression);
  if (ts.isIdentifier(expression)) return { name: expression.text };
  if (ts.isPropertyAccessExpression(expression))
    return {
      name: expression.name.text,
      ...(ts.isIdentifier(expression.expression)
        ? { namespace: expression.expression.text }
        : {}),
    };
  if (
    ts.isElementAccessExpression(expression) &&
    expression.argumentExpression &&
    (ts.isStringLiteral(expression.argumentExpression) ||
      ts.isNoSubstitutionTemplateLiteral(expression.argumentExpression))
  )
    return { name: expression.argumentExpression.text };
  return undefined;
}

export function directCallCommandLocation(
  call: ts.CallExpression,
  sourceFile: ts.SourceFile,
): SourceLocation | undefined {
  if (ts.isExpressionStatement(call.parent)) {
    return locationOf(call.parent, sourceFile);
  }
  if (ts.isAwaitExpression(call.parent) && ts.isExpressionStatement(call.parent.parent)) {
    return locationOf(call.parent.parent, sourceFile);
  }
  return undefined;
}
