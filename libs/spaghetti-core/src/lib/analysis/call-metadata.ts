import * as ts from 'typescript';
import { isFunction } from './ast';

export function discardedCall(call: ts.CallExpression, checker: ts.TypeChecker) {
  const receiver = callReceiver(call.expression);
  const expression = unwrapExpression(call.expression as ts.Expression);
  return {
    kind: 'discarded-call' as const,
    ...(receiver ? { target: receiver } : {}),
    call: callName(call.expression),
    external: ts.isIdentifier(expression)
      ? hasExternalImplementation(call, checker)
      : false,
  };
}

function callReceiver(expression: ts.LeftHandSideExpression): ts.Expression | undefined {
  const unwrapped = unwrapExpression(expression as ts.Expression);
  if (ts.isPropertyAccessExpression(unwrapped)) return unwrapped.expression;
  if (ts.isElementAccessExpression(unwrapped)) return unwrapped.expression;
  return ts.isIdentifier(unwrapped) ? unwrapped : undefined;
}

function callName(expression: ts.LeftHandSideExpression): string {
  const unwrapped = unwrapExpression(expression as ts.Expression);
  if (ts.isIdentifier(unwrapped)) return unwrapped.text;
  if (ts.isPropertyAccessExpression(unwrapped))
    return `${callName(unwrapped.expression as ts.LeftHandSideExpression)}.${
      unwrapped.name.text
    }`;
  if (
    ts.isElementAccessExpression(unwrapped) &&
    unwrapped.argumentExpression &&
    ts.isStringLiteralLike(unwrapped.argumentExpression)
  )
    return `${callName(unwrapped.expression as ts.LeftHandSideExpression)}.${
      unwrapped.argumentExpression.text
    }`;
  return unwrapped.getText();
}

function hasExternalImplementation(
  call: ts.CallExpression,
  checker: ts.TypeChecker,
): boolean {
  const declaration = checker.getResolvedSignature(call)?.declaration;
  if (!declaration || declaration.getSourceFile().isDeclarationFile) return true;
  return !isFunction(declaration) || !declaration.body;
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
  let unwrapped = expression;
  while (
    ts.isParenthesizedExpression(unwrapped) ||
    ts.isAsExpression(unwrapped) ||
    ts.isTypeAssertionExpression(unwrapped) ||
    ts.isNonNullExpression(unwrapped) ||
    ts.isSatisfiesExpression(unwrapped) ||
    ts.isPartiallyEmittedExpression(unwrapped)
  )
    unwrapped = unwrapped.expression;
  return unwrapped;
}
