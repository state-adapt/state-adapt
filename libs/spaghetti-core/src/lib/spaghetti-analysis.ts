import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

export type CommandKind =
  | 'discarded-call'
  | 'assignment'
  | 'property-assignment'
  | 'increment'
  | 'decrement'
  | 'delete';

export interface SourceLocation {
  filePath: string;
  start: { line: number; column: number };
  end: { line: number; column: number };
}

export interface Distance {
  line: number;
  scope: number;
  functionCall: number;
  file: number;
}

export interface CommandHop {
  caller: string;
  callee: string;
  callLocation: SourceLocation;
  definitionLocation: SourceLocation;
  distance: Distance;
}

export interface Declaration {
  name: string;
  kind: 'variable' | 'parameter' | 'function' | 'import' | 'class' | 'unknown';
  location: SourceLocation;
}

export interface Command {
  kind: CommandKind;
  location: SourceLocation;
  originFunction: string;
  callPath: CommandHop[];
  distance: Distance;
  score: number;
  resource?: string;
  declaration?: Declaration;
  remote: boolean;
}

export interface FunctionAnalysis {
  functionId: string;
  name: string;
  location: SourceLocation;
  size: number;
  commands: Command[];
  score: number;
}

export interface FileAnalysis {
  filePath: string;
  functions: FunctionAnalysis[];
  commands: Command[];
  score: number;
}

export interface ProjectAnalysis {
  rootDir: string;
  files: FileAnalysis[];
  score: number;
}

export interface ScoringConfig {
  baseScores: Record<CommandKind, number>;
  lineDistanceWeight: number;
  scopeDistanceWeight: number;
  functionSizeWeight: number;
}

export interface AnalysisOptions {
  scoring?: Partial<Omit<ScoringConfig, 'baseScores'>> & {
    baseScores?: Partial<Record<CommandKind, number>>;
  };
  extensions?: string[];
  exclude?: (string | RegExp)[];
}

export const defaultScoring: ScoringConfig = {
  baseScores: {
    'discarded-call': 1,
    assignment: 2,
    'property-assignment': 3,
    increment: 2,
    decrement: 2,
    delete: 4,
  },
  lineDistanceWeight: 0.1,
  scopeDistanceWeight: 2,
  functionSizeWeight: 0,
};

interface Scope {
  parent?: Scope;
  declarations: Map<string, Declaration>;
}

export function analyzeFunction(
  sourceText: string,
  functionName: string,
  filePath = 'source.ts',
  options: AnalysisOptions = {},
): FunctionAnalysis | undefined {
  return analyzeFile(sourceText, filePath, options).functions.find(
    fn => fn.name === functionName || fn.functionId === functionName,
  );
}

export function analyzeFile(
  sourceText: string,
  filePath = 'source.ts',
  options: AnalysisOptions = {},
): FileAnalysis {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(filePath),
  );
  const nodeScopes = new Map<ts.Node, Scope>();
  const rootScope: Scope = { declarations: new Map() };
  buildScopes(sourceFile, rootScope, nodeScopes, sourceFile);
  const functions: FunctionAnalysis[] = [];
  visitFunctions(sourceFile, sourceFile, nodeScopes, options, functions);
  const commands = functions.flatMap(fn => fn.commands);
  return {
    filePath,
    functions,
    commands,
    score: functions.reduce((sum, fn) => sum + fn.score, 0),
  };
}

export function analyzeProject(
  rootDir: string,
  options: AnalysisOptions = {},
): ProjectAnalysis {
  const absoluteRoot = path.resolve(rootDir);
  const extensions = options.extensions ?? ['.ts', '.tsx', '.js', '.jsx'];
  const files = collectFiles(absoluteRoot, extensions, options.exclude ?? []).map(
    filePath => analyzeFile(fs.readFileSync(filePath, 'utf8'), filePath, options),
  );
  return {
    rootDir: absoluteRoot,
    files,
    score: files.reduce((sum, file) => sum + file.score, 0),
  };
}

function visitFunctions(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  scopes: Map<ts.Node, Scope>,
  options: AnalysisOptions,
  output: FunctionAnalysis[],
): void {
  if (isFunction(node) && node.body) {
    const name = functionName(node, sourceFile);
    const location = locationOf(node, sourceFile);
    const size = location.end.line - location.start.line + 1;
    const functionId = `${sourceFile.fileName}:${name}@${location.start.line}`;
    const commands: Command[] = [];
    collectCommands(node.body, node, sourceFile, scopes, options, functionId, size, commands);
    output.push({
      functionId,
      name,
      location,
      size,
      commands,
      score: commands.reduce((sum, command) => sum + command.score, 0),
    });
  }
  ts.forEachChild(node, child =>
    visitFunctions(child, sourceFile, scopes, options, output),
  );
}

function collectCommands(
  node: ts.Node,
  owner: ts.FunctionLikeDeclaration,
  sourceFile: ts.SourceFile,
  scopes: Map<ts.Node, Scope>,
  options: AnalysisOptions,
  functionId: string,
  functionSize: number,
  output: Command[],
): void {
  if (node !== owner.body && isFunction(node)) return;
  const detected = detectCommand(node);
  if (detected) {
    const location = locationOf(node, sourceFile);
    const resource = resourceName(detected.target);
    const resolution = resource
      ? resolveDeclaration(resource, scopes.get(node))
      : undefined;
    const distance: Distance = {
      line: resolution
        ? Math.abs(location.start.line - resolution.declaration.location.start.line)
        : 0,
      scope: resolution?.scopeDistance ?? 0,
      functionCall: 0,
      file: 0,
    };
    const scoring = scoringConfig(options);
    const score =
      scoring.baseScores[detected.kind] +
      distance.line * scoring.lineDistanceWeight +
      distance.scope * scoring.scopeDistanceWeight +
      functionSize * scoring.functionSizeWeight;
    output.push({
      kind: detected.kind,
      location,
      originFunction: functionId,
      callPath: [],
      distance,
      score,
      ...(resource ? { resource } : {}),
      ...(resolution ? { declaration: resolution.declaration } : {}),
      remote: Boolean(resource && (!resolution || resolution.scopeDistance > 0)),
    });
  }
  ts.forEachChild(node, child =>
    collectCommands(child, owner, sourceFile, scopes, options, functionId, functionSize, output),
  );
}

function detectCommand(
  node: ts.Node,
): { kind: CommandKind; target?: ts.Expression } | undefined {
  if (ts.isExpressionStatement(node)) {
    const expression = ts.isAwaitExpression(node.expression)
      ? node.expression.expression
      : node.expression;
    if (ts.isCallExpression(expression)) return { kind: 'discarded-call' };
  }
  if (ts.isBinaryExpression(node) && isAssignmentOperator(node.operatorToken.kind)) {
    return {
      kind:
        ts.isPropertyAccessExpression(node.left) ||
        ts.isElementAccessExpression(node.left)
          ? 'property-assignment'
          : 'assignment',
      target: node.left,
    };
  }
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
  ) {
    return { kind: 'delete', target: node.expression };
  }
  return undefined;
}

function buildScopes(
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
  const scope: Scope = createsScope
    ? { parent: current, declarations: new Map() }
    : current;
  scopes.set(node, scope);
  registerDeclaration(node, scope, sourceFile);
  ts.forEachChild(node, child => buildScopes(child, scope, scopes, sourceFile));
}

function registerDeclaration(
  node: ts.Node,
  scope: Scope,
  sourceFile: ts.SourceFile,
): void {
  if (ts.isVariableDeclaration(node)) {
    registerBinding(node.name, 'variable', node, scope, sourceFile);
  } else if (ts.isParameter(node)) {
    registerBinding(node.name, 'parameter', node, scope, sourceFile);
  } else if (
    (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) &&
    node.name
  ) {
    addDeclaration(
      node.name.text,
      ts.isClassDeclaration(node) ? 'class' : 'function',
      node.name,
      scope,
      sourceFile,
    );
  } else if (ts.isImportClause(node) && node.name) {
    addDeclaration(node.name.text, 'import', node.name, scope, sourceFile);
  } else if (ts.isImportSpecifier(node)) {
    addDeclaration(node.name.text, 'import', node.name, scope, sourceFile);
  } else if (ts.isNamespaceImport(node)) {
    addDeclaration(node.name.text, 'import', node.name, scope, sourceFile);
  }
}

function registerBinding(
  name: ts.BindingName,
  kind: Declaration['kind'],
  node: ts.Node,
  scope: Scope,
  sourceFile: ts.SourceFile,
): void {
  if (ts.isIdentifier(name)) {
    addDeclaration(name.text, kind, node, scope, sourceFile);
  } else {
    name.elements.forEach(element => {
      if (ts.isBindingElement(element))
        registerBinding(element.name, kind, element, scope, sourceFile);
    });
  }
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

function resolveDeclaration(
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

function resourceName(expression?: ts.Expression): string | undefined {
  if (!expression) return undefined;
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return resourceName(expression.expression);
  if (ts.isElementAccessExpression(expression)) return resourceName(expression.expression);
  if (ts.isParenthesizedExpression(expression)) return resourceName(expression.expression);
  return undefined;
}

function isAssignmentOperator(kind: ts.SyntaxKind): boolean {
  return kind >= ts.SyntaxKind.FirstAssignment && kind <= ts.SyntaxKind.LastAssignment;
}

function isFunction(node: ts.Node): node is ts.FunctionLikeDeclaration {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  );
}

function functionName(node: ts.FunctionLikeDeclaration, source: ts.SourceFile): string {
  if ('name' in node && node.name) return node.name.getText(source);
  if (ts.isConstructorDeclaration(node)) return 'constructor';
  const parent = node.parent;
  if (ts.isVariableDeclaration(parent)) return parent.name.getText(source);
  if (ts.isPropertyAssignment(parent)) return parent.name.getText(source);
  return '<anonymous>';
}

function locationOf(node: ts.Node, sourceFile: ts.SourceFile): SourceLocation {
  const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
  return {
    filePath: sourceFile.fileName,
    start: { line: start.line + 1, column: start.character + 1 },
    end: { line: end.line + 1, column: end.character + 1 },
  };
}

function scoringConfig(options: AnalysisOptions): ScoringConfig {
  return {
    ...defaultScoring,
    ...options.scoring,
    baseScores: { ...defaultScoring.baseScores, ...options.scoring?.baseScores },
  };
}

function scriptKind(filePath: string): ts.ScriptKind {
  if (filePath.endsWith('.tsx')) return ts.ScriptKind.TSX;
  if (filePath.endsWith('.jsx')) return ts.ScriptKind.JSX;
  if (filePath.endsWith('.js')) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function collectFiles(
  directory: string,
  extensions: string[],
  exclude: (string | RegExp)[],
): string[] {
  if (excluded(directory, exclude)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry => {
      const target = path.join(directory, entry.name);
      if (excluded(target, exclude)) return [];
      if (entry.isDirectory()) {
        if (['node_modules', 'dist', 'coverage', '.git'].includes(entry.name)) return [];
        return collectFiles(target, extensions, exclude);
      }
      return extensions.some(extension => entry.name.endsWith(extension)) ? [target] : [];
    });
}

function excluded(filePath: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some(pattern =>
    typeof pattern === 'string' ? filePath.includes(pattern) : pattern.test(filePath),
  );
}
