import * as ts from 'typescript';
import { AnalysisOptions, CommandKind, Distance } from './models';
import {
  CommandDraft,
  FileDraft,
  FunctionDraft,
  CallSite,
  AllocationEscape,
  MODULE_FUNCTION_NAME,
} from './internal-types';
import { buildScopes, Scope } from './scopes';
import {
  apiConfiguration,
  configuredRecognizers,
  createRecognitionContext,
} from './recognizer-config';
import { CommandRecognitionContext, CommandRecognizer } from '../recognizers';
import {
  callTarget,
  detectCommand,
  directCallCommandLocation,
} from './command-detection';
import { functionName, isFunction, locationOf } from './ast';
import { directScoreBreakdown, scoringConfig } from './scoring';
import { collectImports } from './call-resolution';
import { isJsxEventHandler, referencedJsxEventHandlers } from './jsx-context';
import { resolveResource } from './resource-resolution';

export function createFileDraft(
  sourceFile: ts.SourceFile,
  options: AnalysisOptions,
  checker: ts.TypeChecker,
  analyzedFiles: ReadonlySet<ts.SourceFile>,
): FileDraft {
  const scopes = new Map<ts.Node, Scope>();
  buildScopes(sourceFile, { declarations: new Map() }, scopes, sourceFile);
  const imports = collectImports(sourceFile);
  const recognizers = configuredRecognizers(options);
  const recognitionContext = createRecognitionContext(sourceFile, imports, scopes);
  const functions: FunctionDraft[] = [];
  const jsxEventHandlers = referencedJsxEventHandlers(sourceFile, checker);
  const module = createModuleDraft(
    sourceFile,
    scopes,
    options,
    recognizers,
    recognitionContext,
    checker,
    analyzedFiles,
  );
  if (module) functions.push(module);
  visitFunctions(
    sourceFile,
    sourceFile,
    scopes,
    options,
    recognizers,
    recognitionContext,
    checker,
    analyzedFiles,
    jsxEventHandlers,
    functions,
  );
  return { sourceFile, functions, imports };
}

function createModuleDraft(
  sourceFile: ts.SourceFile,
  scopes: Map<ts.Node, Scope>,
  options: AnalysisOptions,
  recognizers: readonly CommandRecognizer[],
  recognitionContext: CommandRecognitionContext,
  checker: ts.TypeChecker,
  analyzedFiles: ReadonlySet<ts.SourceFile>,
): FunctionDraft | undefined {
  const name = MODULE_FUNCTION_NAME;
  const location = locationOf(sourceFile, sourceFile);
  const functionId = `${sourceFile.fileName}:${name}@1`;
  const directCommands: CommandDraft[] = [];
  const calls: CallSite[] = [];
  const escapeAnalysis = createLocalEscapeAnalysis();
  collectFunctionBody(
    sourceFile,
    sourceFile,
    sourceFile,
    scopes,
    options,
    recognizers,
    recognitionContext,
    checker,
    analyzedFiles,
    functionId,
    location.end.line,
    directCommands,
    calls,
    escapeAnalysis,
  );
  if (directCommands.length === 0 && calls.length === 0) return undefined;
  return {
    node: sourceFile,
    functionId,
    name,
    location,
    size: location.end.line,
    commands: directCommands,
    score: directCommands.reduce((sum, command) => sum + command.score, 0),
    sourceFile,
    scopes,
    directCommands,
    calls,
    allocationEscapes: escapeAnalysis.escapes,
    jsxEventHandler: false,
  };
}

function visitFunctions(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  scopes: Map<ts.Node, Scope>,
  options: AnalysisOptions,
  recognizers: readonly CommandRecognizer[],
  recognitionContext: CommandRecognitionContext,
  checker: ts.TypeChecker,
  analyzedFiles: ReadonlySet<ts.SourceFile>,
  jsxEventHandlers: ReadonlySet<ts.FunctionLikeDeclaration>,
  output: FunctionDraft[],
): void {
  if (isFunction(node) && node.body) {
    const name = functionName(node, sourceFile);
    const location = locationOf(node, sourceFile);
    const size = location.end.line - location.start.line + 1;
    const functionId = `${sourceFile.fileName}:${name}@${location.start.line}`;
    const directCommands: CommandDraft[] = [];
    const calls: CallSite[] = [];
    const escapeAnalysis = createLocalEscapeAnalysis();
    collectFunctionBody(
      node.body,
      node,
      sourceFile,
      scopes,
      options,
      recognizers,
      recognitionContext,
      checker,
      analyzedFiles,
      functionId,
      size,
      directCommands,
      calls,
      escapeAnalysis,
    );
    output.push({
      node,
      functionId,
      name,
      location,
      size,
      commands: directCommands,
      score: directCommands.reduce((sum, command) => sum + command.score, 0),
      sourceFile,
      scopes,
      directCommands,
      calls,
      allocationEscapes: escapeAnalysis.escapes,
      jsxEventHandler: isJsxEventHandler(node) || jsxEventHandlers.has(node),
    });
  }
  ts.forEachChild(node, child =>
    visitFunctions(
      child,
      sourceFile,
      scopes,
      options,
      recognizers,
      recognitionContext,
      checker,
      analyzedFiles,
      jsxEventHandlers,
      output,
    ),
  );
}

function collectFunctionBody(
  node: ts.Node,
  owner: ts.FunctionLikeDeclaration | ts.SourceFile,
  sourceFile: ts.SourceFile,
  scopes: Map<ts.Node, Scope>,
  options: AnalysisOptions,
  recognizers: readonly CommandRecognizer[],
  recognitionContext: CommandRecognitionContext,
  checker: ts.TypeChecker,
  analyzedFiles: ReadonlySet<ts.SourceFile>,
  functionId: string,
  functionSize: number,
  commands: CommandDraft[],
  calls: CallSite[],
  escapeAnalysis: LocalEscapeAnalysis,
): void {
  const ownerBody = ts.isSourceFile(owner) ? owner : owner.body;
  if (node !== ownerBody && isFunction(node)) return;
  collectAllocationEscapesAtNode(node, owner, sourceFile, checker, escapeAnalysis);
  const detected = detectCommand(node, recognizers, recognitionContext, checker, owner);
  const apiPenalty = detected?.api
    ? apiConfiguration(options).penalties.get(detected.api)
    : undefined;
  if (detected && apiPenalty !== 0)
    commands.push(
      createDirectCommand(
        detected,
        node,
        sourceFile,
        scopes,
        checker,
        analyzedFiles,
        options,
        functionId,
        functionSize,
      ),
    );
  if (ts.isCallExpression(node)) {
    const target = callTarget(node.expression);
    calls.push({
      node,
      location: locationOf(node, sourceFile),
      directCommandLocation: directCallCommandLocation(node, sourceFile),
      name: target?.name ?? '',
      ...(target?.namespace ? { namespace: target.namespace } : {}),
    });
  }
  ts.forEachChild(node, child =>
    collectFunctionBody(
      child,
      owner,
      sourceFile,
      scopes,
      options,
      recognizers,
      recognitionContext,
      checker,
      analyzedFiles,
      functionId,
      functionSize,
      commands,
      calls,
      escapeAnalysis,
    ),
  );
}

interface LocalAllocationTrace {
  locations: ReturnType<typeof locationOf>[];
  complete: boolean;
}

interface LocalEscapeAnalysis {
  aliases: Map<ts.Symbol, LocalAllocationTrace>;
  escapes: AllocationEscape[];
}

function createLocalEscapeAnalysis(): LocalEscapeAnalysis {
  return { aliases: new Map(), escapes: [] };
}

/**
 * Track only syntactic, function-local allocation aliases while the body is already
 * being collected. Full provenance tracing here would make every call argument pay
 * the interprocedural resolution cost that argument binding otherwise defers.
 */
function collectAllocationEscapesAtNode(
  node: ts.Node,
  owner: ts.FunctionLikeDeclaration | ts.SourceFile,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  analysis: LocalEscapeAnalysis,
): void {
  const { aliases, escapes } = analysis;
  const trace = (expression: ts.Expression) =>
    traceLocalAllocations(expression, sourceFile, checker, aliases);
  const record = (value: ts.Expression, escapeNode: ts.Node): void => {
    const escapeLocation = locationOf(escapeNode, sourceFile);
    for (const allocation of trace(value).locations)
      if (
        !escapes.some(
          escape =>
            sameSourceLocation(escape.allocation, allocation) &&
            sameSourceLocation(escape.location, escapeLocation),
        )
      )
        escapes.push({ allocation, location: escapeLocation });
  };
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
    const symbol = checker.getSymbolAtLocation(node.name);
    if (symbol) aliases.set(symbol, trace(node.initializer));
  }
  if (ts.isCallExpression(node))
    for (const argument of node.arguments)
      record(ts.isSpreadElement(argument) ? argument.expression : argument, node);
  if (
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind === ts.SyntaxKind.EqualsToken
  ) {
    const right = trace(node.right);
    if (isReachableLocalStorage(node.left, owner, checker, aliases))
      record(node.right, node);
    if (ts.isIdentifier(node.left)) {
      const symbol = checker.getSymbolAtLocation(node.left);
      if (symbol && isBindingOwnedBy(symbol, owner)) {
        const previous = aliases.get(symbol);
        aliases.set(symbol, previous ? mergeLocalTraces(previous, right) : right);
      }
    }
  }
}

function traceLocalAllocations(
  expression: ts.Expression,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  aliases: ReadonlyMap<ts.Symbol, LocalAllocationTrace>,
): LocalAllocationTrace {
  const value = unwrapLocalExpression(expression);
  if (isLocalAllocation(value))
    return { locations: [locationOf(value, sourceFile)], complete: true };
  if (ts.isIdentifier(value)) {
    const symbol = checker.getSymbolAtLocation(value);
    return symbol ? aliases.get(symbol) ?? unknownTrace() : unknownTrace();
  }
  if (ts.isConditionalExpression(value))
    return mergeLocalTraces(
      traceLocalAllocations(value.whenTrue, sourceFile, checker, aliases),
      traceLocalAllocations(value.whenFalse, sourceFile, checker, aliases),
    );
  if (ts.isBinaryExpression(value)) {
    if (
      value.operatorToken.kind === ts.SyntaxKind.CommaToken ||
      value.operatorToken.kind === ts.SyntaxKind.EqualsToken
    )
      return traceLocalAllocations(value.right, sourceFile, checker, aliases);
    if (
      value.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
      value.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
      value.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
    )
      return mergeLocalTraces(
        traceLocalAllocations(value.left, sourceFile, checker, aliases),
        traceLocalAllocations(value.right, sourceFile, checker, aliases),
      );
  }
  if (ts.isAwaitExpression(value) || ts.isYieldExpression(value))
    return value.expression
      ? traceLocalAllocations(value.expression, sourceFile, checker, aliases)
      : unknownTrace();
  return unknownTrace();
}

function isReachableLocalStorage(
  target: ts.Expression,
  owner: ts.FunctionLikeDeclaration | ts.SourceFile,
  checker: ts.TypeChecker,
  aliases: ReadonlyMap<ts.Symbol, LocalAllocationTrace>,
): boolean {
  if (ts.isPropertyAccessExpression(target) || ts.isElementAccessExpression(target)) {
    if (target.expression.kind === ts.SyntaxKind.ThisKeyword) return true;
    const receiver = unwrapLocalExpression(target.expression);
    if (!ts.isIdentifier(receiver)) return true;
    const symbol = checker.getSymbolAtLocation(receiver);
    const traced = symbol ? aliases.get(symbol) : undefined;
    return !traced?.complete || traced.locations.length === 0;
  }
  if (!ts.isIdentifier(target)) return false;
  const symbol = checker.getSymbolAtLocation(target);
  return !symbol || !isBindingOwnedBy(symbol, owner);
}

function isBindingOwnedBy(
  symbol: ts.Symbol,
  owner: ts.FunctionLikeDeclaration | ts.SourceFile,
): boolean {
  return Boolean(
    symbol.declarations?.length &&
      symbol.declarations.every(declaration => declarationOwner(declaration) === owner),
  );
}

function declarationOwner(node: ts.Node): ts.FunctionLikeDeclaration | ts.SourceFile {
  let current = node.parent;
  while (!ts.isSourceFile(current) && !isFunction(current)) current = current.parent;
  return current;
}

function isLocalAllocation(expression: ts.Expression): boolean {
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

function unwrapLocalExpression(expression: ts.Expression): ts.Expression {
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

function mergeLocalTraces(
  left: LocalAllocationTrace,
  right: LocalAllocationTrace,
): LocalAllocationTrace {
  const locations = [...left.locations];
  for (const location of right.locations)
    if (!locations.some(existing => sameSourceLocation(existing, location)))
      locations.push(location);
  return { locations, complete: left.complete && right.complete };
}

function unknownTrace(): LocalAllocationTrace {
  return { locations: [], complete: false };
}

function sameSourceLocation(
  left: ReturnType<typeof locationOf>,
  right: ReturnType<typeof locationOf>,
): boolean {
  return (
    left.filePath === right.filePath &&
    left.start.line === right.start.line &&
    left.start.column === right.start.column &&
    left.end.line === right.end.line &&
    left.end.column === right.end.column
  );
}

function createDirectCommand(
  detected: {
    kind: CommandKind;
    target?: ts.Expression;
    api?: string;
    recognizer?: string;
    call?: string;
    external?: boolean;
  },
  node: ts.Node,
  sourceFile: ts.SourceFile,
  scopes: Map<ts.Node, Scope>,
  checker: ts.TypeChecker,
  analyzedFiles: ReadonlySet<ts.SourceFile>,
  options: AnalysisOptions,
  functionId: string,
  functionSize: number,
): CommandDraft {
  const location = locationOf(node, sourceFile);
  const resolution = detected.target
    ? resolveResource(
        detected.target,
        node,
        sourceFile,
        scopes,
        checker,
        analyzedFiles,
        options.maxResourceTraceDepth,
      )
    : undefined;
  const distance: Distance = {
    declarationLine: resolution?.distance.declarationLine ?? 0,
    sameFunction: Math.max(
      0,
      location.start.line - Number(functionId.match(/@(\d+)$/)?.[1] ?? 1),
    ),
    scope: resolution?.distance.scope ?? 0,
    functionCall: 0,
    file: resolution?.distance.file ?? 0,
    folder: resolution?.distance.folder ?? 0,
  };
  const resourceDistance = {
    declarationLine: distance.declarationLine,
    scope: distance.scope,
    file: distance.file,
    folder: distance.folder,
  };
  const scoring = scoringConfig(options);
  const external = Boolean(detected.external || resolution?.external);
  const apiPenalty = detected.api
    ? apiConfiguration(options).penalties.get(detected.api)
    : undefined;
  const scoreBreakdown = directScoreBreakdown(
    detected.kind,
    apiPenalty,
    external,
    distance,
    functionSize,
    scoring,
  );
  return {
    kind: detected.kind,
    location,
    originFunction: functionId,
    callPath: [],
    distance,
    resourceDistance,
    restElements: resolution?.restElements ?? [],
    ...(resolution?.truncated ? { resourceTraceTruncated: true } : {}),
    score: scoreBreakdown.total,
    scoreBreakdown,
    ...(resolution?.name ? { resource: resolution.name } : {}),
    ...(detected.api ? { api: detected.api } : {}),
    ...(detected.recognizer ? { recognizer: detected.recognizer } : {}),
    ...(detected.call ? { call: detected.call } : {}),
    ...(external ? { external: true } : {}),
    ...(resolution?.declaration ? { declaration: resolution.declaration } : {}),
    ...(resolution ? { resourceProvenance: resolution.provenance } : {}),
    remote: Boolean(
      resolution &&
        (resolution.external ||
          resolution.distance.scope > 0 ||
          resolution.distance.file > 0),
    ),
  };
}
