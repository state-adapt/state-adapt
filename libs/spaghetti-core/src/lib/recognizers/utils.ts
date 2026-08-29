import * as ts from 'typescript';

import { ApiCommandPattern, CommandRecognitionContext, CommandRecognizer } from './types';

export function methodCall(
  call: ts.CallExpression,
): { receiver: ts.Expression; name: string } | undefined {
  return ts.isPropertyAccessExpression(call.expression)
    ? { receiver: call.expression.expression, name: call.expression.name.text }
    : undefined;
}

export function identifierCall(call: ts.CallExpression): string | undefined {
  return ts.isIdentifier(call.expression) ? call.expression.text : undefined;
}

export function rootIdentifier(expression: ts.Expression): string | undefined {
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression))
    return rootIdentifier(expression.expression);
  if (ts.isElementAccessExpression(expression))
    return rootIdentifier(expression.expression);
  if (ts.isParenthesizedExpression(expression))
    return rootIdentifier(expression.expression);
  return undefined;
}

export function initializedBy(
  expression: ts.Expression,
  call: ts.CallExpression,
  context: CommandRecognitionContext,
  names: readonly string[],
): boolean {
  const root = rootIdentifier(expression);
  if (!root) return false;
  const initializer = context.declarationInitializer(root, call);
  if (!initializer) return false;
  if (ts.isNewExpression(initializer) || ts.isCallExpression(initializer)) {
    const target = initializer.expression;
    const name = ts.isIdentifier(target)
      ? target.text
      : ts.isPropertyAccessExpression(target)
      ? target.name.text
      : undefined;
    return Boolean(name && names.includes(name));
  }
  return names.includes('Array') && ts.isArrayLiteralExpression(initializer);
}

export function patternRecognizer(pattern: ApiCommandPattern): CommandRecognizer {
  return {
    name: `custom:${pattern.name}`,
    recognize(call, context) {
      const method = methodCall(call);
      const fn = identifierCall(call);
      let resource: ts.Expression | undefined;
      let importedName: string | undefined;
      if (method && pattern.methods?.includes(method.name)) {
        const receiverName = rootIdentifier(method.receiver);
        if (
          pattern.receiverNames &&
          (!receiverName || !pattern.receiverNames.includes(receiverName))
        )
          return undefined;
        resource = method.receiver;
        importedName = receiverName;
      } else if (fn && pattern.functions?.includes(fn)) {
        importedName = fn;
        resource = call.arguments[pattern.argumentIndex ?? 0];
      } else return undefined;
      if (
        pattern.importSources &&
        (!importedName ||
          !pattern.importSources.includes(context.importSource(importedName) ?? ''))
      )
        return undefined;
      if (pattern.resource === 'argument')
        resource = call.arguments[pattern.argumentIndex ?? 0];
      else if (pattern.resource === 'receiver' && method) resource = method.receiver;
      return resource ? { api: pattern.name, resource } : undefined;
    },
  };
}
