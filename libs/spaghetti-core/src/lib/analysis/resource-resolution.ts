import * as path from 'node:path';
import * as ts from 'typescript';
import { Declaration, Distance, ResourceOrigin, ResourceProvenance } from './models';
import { isFunction, locationOf } from './ast';
import { folderDistance } from './call-resolution';
import { resolveDeclaration, Scope } from './scopes';

export interface ResolvedResource {
  name: string;
  declaration?: Declaration;
  provenance: ResourceProvenance;
  distance: Pick<Distance, 'declarationLine' | 'scope' | 'file' | 'folder'>;
  external: boolean;
}

interface OriginCandidate {
  kind: ResourceOrigin['kind'];
  node?: ts.Node;
  declarationNode?: ts.Declaration;
  scopeDistance: number;
  parameterIndex?: number;
}

interface Anchor {
  node: ts.Declaration;
  scopeDistance: number;
}

interface TraceResult {
  origins: OriginCandidate[];
  fallback?: Anchor;
}

interface TraceContext {
  checker: ts.TypeChecker;
  analyzedFiles: ReadonlySet<ts.SourceFile>;
  scopes: Map<ts.Node, Scope>;
  substitutions: ReadonlyMap<ts.ParameterDeclaration, ts.Expression>;
  active: Set<ts.Node>;
  depth: number;
}

const maxTraceDepth = 40;

export function resolveResource(
  target: ts.Expression,
  from: ts.Node,
  sourceFile: ts.SourceFile,
  scopes: Map<ts.Node, Scope>,
  checker: ts.TypeChecker,
  analyzedFiles: ReadonlySet<ts.SourceFile>,
): ResolvedResource {
  const expression = unwrap(target);
  const identifier = displayIdentifier(expression);
  const name = identifier?.text ?? expression.getText(sourceFile);
  const traced = traceValue(expression, {
    checker,
    analyzedFiles,
    scopes,
    substitutions: new Map(),
    active: new Set(),
    depth: 0,
  });
  const origins = distinctOrigins(
    traced.origins.map(origin =>
      origin.kind === 'unknown' && !origin.node && traced.fallback
        ? {
            ...origin,
            node: traced.fallback.node,
            declarationNode: traced.fallback.node,
            scopeDistance: traced.fallback.scopeDistance,
          }
        : origin,
    ),
  );
  const external = origins.some(origin => origin.kind === 'external');
  const distanceOrigin = worstOrigin(origins, traced.fallback, from, sourceFile);
  const declarationNode = distanceOrigin?.declarationNode ?? traced.fallback?.node;
  const declaration = declarationNode
    ? declarationFrom(declarationNode, identifier?.text ?? name)
    : undefined;
  const unknownCount = origins.filter(origin => origin.kind === 'unknown').length;
  const provenance: ResourceProvenance = {
    confidence:
      unknownCount === origins.length
        ? 'unknown'
        : unknownCount > 0
        ? 'partial'
        : 'proven',
    origins: origins.map(origin => publicOrigin(origin, identifier?.text ?? name)),
  };
  return {
    name,
    ...(declaration ? { declaration } : {}),
    provenance,
    distance: distanceOrigin?.distance ?? zeroDistance(),
    external,
  };
}

function traceValue(expression: ts.Expression, context: TraceContext): TraceResult {
  if (context.depth >= maxTraceDepth || context.active.has(expression)) return unknown();
  const unwrapped = unwrap(expression);
  if (unwrapped !== expression) return traceValue(unwrapped, context);
  const next = enter(context, expression);
  if (!next) return unknown();

  if (isAllocationExpression(expression))
    return { origins: [{ kind: 'allocation', node: expression, scopeDistance: 0 }] };
  if (ts.isIdentifier(expression)) return traceIdentifier(expression, next);
  if (ts.isPropertyAccessExpression(expression)) {
    if (
      expression.expression.kind === ts.SyntaxKind.ThisKeyword &&
      ts.isIdentifier(expression.name)
    )
      return traceIdentifier(expression.name, next);
    return traceValue(expression.expression, next);
  }
  if (ts.isElementAccessExpression(expression))
    return traceValue(expression.expression, next);
  if (ts.isCallExpression(expression)) return traceCall(expression, next);
  if (ts.isConditionalExpression(expression))
    return merge([
      traceValue(expression.whenTrue, next),
      traceValue(expression.whenFalse, next),
    ]);
  if (ts.isBinaryExpression(expression)) {
    if (expression.operatorToken.kind === ts.SyntaxKind.CommaToken)
      return traceValue(expression.right, next);
    if (
      expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
      expression.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
      expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
    )
      return merge([
        traceValue(expression.left, next),
        traceValue(expression.right, next),
      ]);
    if (expression.operatorToken.kind === ts.SyntaxKind.EqualsToken)
      return traceValue(expression.right, next);
  }
  if (ts.isAwaitExpression(expression) || ts.isYieldExpression(expression))
    return expression.expression ? traceValue(expression.expression, next) : unknown();
  return unknown();
}

function traceIdentifier(identifier: ts.Identifier, context: TraceContext): TraceResult {
  let symbol = context.checker.getSymbolAtLocation(identifier);
  if (!symbol) return unknown();
  const localScope = resolveDeclaration(
    identifier.text,
    context.scopes.get(identifier),
  )?.scopeDistance;
  const aliasDeclarations =
    symbol.flags & ts.SymbolFlags.Alias ? uniqueDeclarations(symbol) : [];
  if (symbol.flags & ts.SymbolFlags.Alias)
    symbol = context.checker.getAliasedSymbol(symbol);
  const declarations = uniqueDeclarations(symbol);
  if (identifier.text === 'globalThis' && declarations.length === 0)
    return {
      origins: [{ kind: 'external', node: identifier, scopeDistance: 0 }],
    };
  const declaration = declarations.find(item =>
    context.analyzedFiles.has(item.getSourceFile()),
  );
  const scopeDistance =
    localScope ??
    (declaration
      ? ts.isPropertyDeclaration(declaration)
        ? 0
        : lexicalScopeDistance(identifier, declaration)
      : 0);

  if (!declaration) {
    if (declarations.length > 0)
      return {
        origins: declarations.map(item => ({
          kind: 'external',
          node: item,
          declarationNode: item,
          scopeDistance,
        })),
      };
    if (aliasDeclarations.length > 0)
      return {
        origins: aliasDeclarations.map(item => ({
          kind: 'external',
          node: item,
          declarationNode: item,
          scopeDistance: localScope ?? 0,
        })),
      };
    return unknown();
  }

  if (ts.isParameter(declaration)) {
    const argument = context.substitutions.get(declaration);
    if (argument) return traceValue(argument, context);
    const parameterIndex = declaration.parent.parameters.indexOf(declaration);
    return {
      origins: [
        {
          kind: 'declaration',
          node: declaration,
          declarationNode: declaration,
          scopeDistance,
          ...(parameterIndex >= 0 ? { parameterIndex } : {}),
        },
      ],
      fallback: { node: declaration, scopeDistance },
    };
  }

  if (ts.isVariableDeclaration(declaration) && declaration.initializer) {
    const traced = traceValue(declaration.initializer, context);
    return {
      ...withMinimumScope(traced, scopeDistance),
      fallback: traced.fallback ?? { node: declaration, scopeDistance },
    };
  }

  if (isAmbientDeclaration(declaration))
    return {
      origins: [
        {
          kind: 'external',
          node: declaration,
          declarationNode: declaration,
          scopeDistance,
        },
      ],
    };

  return {
    origins: [
      {
        kind: 'declaration',
        node: declaration,
        declarationNode: declaration,
        scopeDistance,
      },
    ],
    fallback: { node: declaration, scopeDistance },
  };
}

function traceCall(call: ts.CallExpression, context: TraceContext): TraceResult {
  const declaration = functionImplementation(call, context.checker);
  if (
    !declaration ||
    !declaration.body ||
    !context.analyzedFiles.has(declaration.getSourceFile())
  )
    return unknown();
  const substitutions = new Map(context.substitutions);
  declaration.parameters.forEach((parameter, index) => {
    const argument = call.arguments[index];
    if (argument) substitutions.set(parameter, argument);
    else if (parameter.initializer) substitutions.set(parameter, parameter.initializer);
  });
  const nested = { ...context, substitutions };
  if (!ts.isBlock(declaration.body)) return traceValue(declaration.body, nested);
  const returns: ts.Expression[] = [];
  collectReturns(declaration.body, declaration, returns);
  return returns.length
    ? merge(returns.map(expression => traceValue(expression, nested)))
    : unknown();
}

function collectReturns(
  node: ts.Node,
  owner: ts.FunctionLikeDeclaration,
  output: ts.Expression[],
): void {
  if (node !== owner.body && ts.isFunctionLike(node)) return;
  if (ts.isReturnStatement(node)) {
    if (node.expression) output.push(node.expression);
    return;
  }
  ts.forEachChild(node, child => collectReturns(child, owner, output));
}

function functionImplementation(
  call: ts.CallExpression,
  checker: ts.TypeChecker,
): ts.FunctionLikeDeclaration | undefined {
  const resolved = checker.getResolvedSignature(call)?.declaration;
  if (resolved && isFunction(resolved) && resolved.body) return resolved;
  const symbol = checker.getSymbolAtLocation(call.expression);
  return symbol?.declarations?.find(
    (item): item is ts.FunctionLikeDeclaration => isFunction(item) && !!item.body,
  );
}

function isAllocationExpression(expression: ts.Expression): boolean {
  return (
    ts.isArrayLiteralExpression(expression) ||
    ts.isObjectLiteralExpression(expression) ||
    ts.isNewExpression(expression) ||
    ts.isClassExpression(expression) ||
    ts.isFunctionExpression(expression) ||
    ts.isArrowFunction(expression) ||
    ts.isRegularExpressionLiteral(expression)
  );
}

function unwrap(expression: ts.Expression): ts.Expression {
  let current = expression;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isNonNullExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isPartiallyEmittedExpression(current)
  )
    current = current.expression;
  return current;
}

function enter(context: TraceContext, node: ts.Node): TraceContext | undefined {
  if (context.active.has(node)) return undefined;
  const active = new Set(context.active);
  active.add(node);
  return { ...context, active, depth: context.depth + 1 };
}

function merge(results: TraceResult[]): TraceResult {
  return {
    origins: results.flatMap(result => result.origins),
    fallback: results.find(result => result.fallback)?.fallback,
  };
}

function withMinimumScope(result: TraceResult, minimum: number): TraceResult {
  return {
    origins: result.origins.map(origin => ({
      ...origin,
      scopeDistance: Math.max(origin.scopeDistance, minimum),
    })),
    ...(result.fallback
      ? {
          fallback: {
            ...result.fallback,
            scopeDistance: Math.max(result.fallback.scopeDistance, minimum),
          },
        }
      : {}),
  };
}

function distinctOrigins(origins: OriginCandidate[]): OriginCandidate[] {
  const unique = new Map<string, OriginCandidate>();
  for (const origin of origins) {
    const location = origin.node
      ? locationOf(origin.node, origin.node.getSourceFile()).start
      : undefined;
    const key = `${origin.kind}:${origin.node?.getSourceFile().fileName ?? ''}:${
      location?.line ?? 0
    }:${location?.column ?? 0}:${origin.parameterIndex ?? ''}`;
    if (!unique.has(key)) unique.set(key, origin);
  }
  return [...unique.values()];
}

function worstOrigin(
  origins: OriginCandidate[],
  fallback: Anchor | undefined,
  from: ts.Node,
  sourceFile: ts.SourceFile,
):
  | (OriginCandidate & {
      distance: Pick<Distance, 'declarationLine' | 'scope' | 'file' | 'folder'>;
    })
  | undefined {
  const candidates = origins
    .filter(
      origin =>
        origin.node &&
        (origin.kind !== 'external' ||
          Boolean(
            origin.declarationNode &&
              !origin.declarationNode.getSourceFile().isDeclarationFile,
          )),
    )
    .map(origin => ({ ...origin, distance: distanceFrom(origin, from, sourceFile) }));
  if (
    candidates.length === 0 &&
    fallback &&
    origins.some(origin => origin.kind === 'unknown')
  ) {
    const origin: OriginCandidate = {
      kind: 'unknown',
      node: fallback.node,
      declarationNode: fallback.node,
      scopeDistance: fallback.scopeDistance,
    };
    candidates.push({ ...origin, distance: distanceFrom(origin, from, sourceFile) });
  }
  return candidates.sort((left, right) => distanceRank(right) - distanceRank(left))[0];
}

function distanceFrom(
  origin: OriginCandidate,
  from: ts.Node,
  sourceFile: ts.SourceFile,
): Pick<Distance, 'declarationLine' | 'scope' | 'file' | 'folder'> {
  if (!origin.node) return zeroDistance();
  const originFile = origin.node.getSourceFile();
  const sameFile = originFile === sourceFile;
  return {
    declarationLine: sameFile
      ? Math.abs(
          locationOf(from, sourceFile).start.line -
            locationOf(origin.node, originFile).start.line,
        )
      : 0,
    scope: origin.scopeDistance,
    file: sameFile ? 0 : 1,
    folder: sameFile
      ? 0
      : folderDistance(
          path.dirname(path.resolve(sourceFile.fileName)),
          path.dirname(path.resolve(originFile.fileName)),
        ),
  };
}

function distanceRank(candidate: {
  distance: Pick<Distance, 'declarationLine' | 'scope' | 'file' | 'folder'>;
}): number {
  const distance = candidate.distance;
  return (
    distance.file * 1_000_000_000 +
    distance.folder * 1_000_000 +
    distance.scope * 1_000 +
    distance.declarationLine
  );
}

function publicOrigin(origin: OriginCandidate, name: string): ResourceOrigin {
  const declaration = origin.declarationNode
    ? declarationFrom(origin.declarationNode, name)
    : undefined;
  return {
    kind: origin.kind,
    ...(origin.node
      ? { location: locationOf(origin.node, origin.node.getSourceFile()) }
      : {}),
    ...(declaration ? { declaration } : {}),
    ...(origin.parameterIndex !== undefined
      ? { parameterIndex: origin.parameterIndex }
      : {}),
  };
}

function uniqueDeclarations(symbol: ts.Symbol): ts.Declaration[] {
  return [...new Set([symbol.valueDeclaration, ...(symbol.declarations ?? [])])].filter(
    (item): item is ts.Declaration => item !== undefined,
  );
}

function isAmbientDeclaration(declaration: ts.Declaration): boolean {
  if (declaration.getSourceFile().isDeclarationFile) return true;
  let current: ts.Node | undefined = declaration;
  while (current) {
    if (
      ts.canHaveModifiers(current) &&
      (ts.getCombinedModifierFlags(current as ts.Declaration) &
        ts.ModifierFlags.Ambient) !==
        0
    )
      return true;
    current = current.parent;
  }
  return false;
}

function lexicalScopeDistance(use: ts.Node, declaration: ts.Declaration): number {
  if (use.getSourceFile() !== declaration.getSourceFile()) return 0;
  const target = declarationScope(declaration);
  let scope = containingScope(use);
  let distance = 0;
  while (scope && scope !== target) {
    scope = containingScope(scope.parent);
    distance += 1;
  }
  return scope === target ? distance : 0;
}

function declarationScope(declaration: ts.Declaration): ts.Node | undefined {
  if (ts.isParameter(declaration)) return declaration.parent;
  if (ts.isFunctionDeclaration(declaration)) return containingScope(declaration.parent);
  return containingScope(declaration);
}

function containingScope(node: ts.Node | undefined): ts.Node | undefined {
  let current = node;
  while (current) {
    if (
      ts.isSourceFile(current) ||
      ts.isFunctionLike(current) ||
      ts.isCatchClause(current)
    )
      return current;
    if (ts.isBlock(current) && !ts.isFunctionLike(current.parent)) return current;
    current = current.parent;
  }
  return undefined;
}

function displayIdentifier(expression: ts.Expression): ts.Identifier | undefined {
  if (ts.isIdentifier(expression)) return expression;
  if (ts.isPropertyAccessExpression(expression)) {
    if (
      expression.expression.kind === ts.SyntaxKind.ThisKeyword &&
      ts.isIdentifier(expression.name)
    )
      return expression.name;
    return displayIdentifier(expression.expression);
  }
  if (ts.isElementAccessExpression(expression))
    return displayIdentifier(expression.expression);
  return undefined;
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

function unknown(): TraceResult {
  return { origins: [{ kind: 'unknown', scopeDistance: 0 }] };
}

function zeroDistance(): Pick<Distance, 'declarationLine' | 'scope' | 'file' | 'folder'> {
  return { declarationLine: 0, scope: 0, file: 0, folder: 0 };
}
