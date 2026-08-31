import * as ts from 'typescript';
import { AnalysisOptions, Command, CommandKind, Distance } from './models';
import { FileDraft, FunctionDraft, CallSite } from './internal-types';
import { buildScopes, resolveDeclaration, resourceName, Scope } from './scopes';
import { configuredRecognizers, createRecognitionContext } from './recognizer-config';
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

export function createFileDraft(
  sourceFile: ts.SourceFile,
  options: AnalysisOptions,
  checker: ts.TypeChecker,
): FileDraft {
  const scopes = new Map<ts.Node, Scope>();
  buildScopes(sourceFile, { declarations: new Map() }, scopes, sourceFile);
  const imports = collectImports(sourceFile);
  const recognizers = configuredRecognizers(options);
  const recognitionContext = createRecognitionContext(sourceFile, imports, scopes);
  const functions: FunctionDraft[] = [];
  const jsxEventHandlers = referencedJsxEventHandlers(sourceFile, checker);
  visitFunctions(
    sourceFile,
    sourceFile,
    scopes,
    options,
    recognizers,
    recognitionContext,
    checker,
    jsxEventHandlers,
    functions,
  );
  return { sourceFile, functions, imports };
}

function visitFunctions(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  scopes: Map<ts.Node, Scope>,
  options: AnalysisOptions,
  recognizers: readonly CommandRecognizer[],
  recognitionContext: CommandRecognitionContext,
  checker: ts.TypeChecker,
  jsxEventHandlers: ReadonlySet<ts.FunctionLikeDeclaration>,
  output: FunctionDraft[],
): void {
  if (isFunction(node) && node.body) {
    const name = functionName(node, sourceFile);
    const location = locationOf(node, sourceFile);
    const size = location.end.line - location.start.line + 1;
    const functionId = `${sourceFile.fileName}:${name}@${location.start.line}`;
    const directCommands: Command[] = [];
    const calls: CallSite[] = [];
    collectFunctionBody(
      node.body,
      node,
      sourceFile,
      scopes,
      options,
      recognizers,
      recognitionContext,
      checker,
      functionId,
      size,
      directCommands,
      calls,
    );
    output.push({
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
      jsxEventHandlers,
      output,
    ),
  );
}

function collectFunctionBody(
  node: ts.Node,
  owner: ts.FunctionLikeDeclaration,
  sourceFile: ts.SourceFile,
  scopes: Map<ts.Node, Scope>,
  options: AnalysisOptions,
  recognizers: readonly CommandRecognizer[],
  recognitionContext: CommandRecognitionContext,
  checker: ts.TypeChecker,
  functionId: string,
  functionSize: number,
  commands: Command[],
  calls: CallSite[],
): void {
  if (node !== owner.body && isFunction(node)) return;
  const detected = detectCommand(node, recognizers, recognitionContext, checker, owner);
  if (detected)
    commands.push(
      createDirectCommand(
        detected,
        node,
        sourceFile,
        scopes,
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
      functionId,
      functionSize,
      commands,
      calls,
    ),
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
  options: AnalysisOptions,
  functionId: string,
  functionSize: number,
): Command {
  const location = locationOf(node, sourceFile);
  const resource = resourceName(detected.target);
  const resolution = resource
    ? resolveDeclaration(resource, scopes.get(node))
    : undefined;
  const distance: Distance = {
    declarationLine: resolution
      ? Math.abs(location.start.line - resolution.declaration.location.start.line)
      : 0,
    sameFunction: Math.max(
      0,
      location.start.line - Number(functionId.match(/@(\d+)$/)?.[1] ?? 1),
    ),
    scope: resolution?.scopeDistance ?? 0,
    functionCall: 0,
    file: 0,
    folder: 0,
  };
  const scoring = scoringConfig(options);
  const scoreBreakdown = directScoreBreakdown(
    detected.kind,
    detected.api,
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
    score: scoreBreakdown.total,
    scoreBreakdown,
    ...(resource ? { resource } : {}),
    ...(detected.api ? { api: detected.api } : {}),
    ...(detected.recognizer ? { recognizer: detected.recognizer } : {}),
    ...(detected.call ? { call: detected.call } : {}),
    ...(detected.external ||
    (resource && (!resolution || resolution.declaration.kind === 'import'))
      ? { external: true }
      : {}),
    ...(resolution ? { declaration: resolution.declaration } : {}),
    remote: Boolean(resource && (!resolution || resolution.scopeDistance > 0)),
  };
}
