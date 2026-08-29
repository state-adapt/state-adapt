import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

import {
  ApiCommandPattern,
  BuiltInRecognizerName,
  builtInRecognizers,
  CommandRecognitionContext,
  CommandRecognizer,
  patternRecognizer,
} from './recognizers';

export type CommandKind =
  | 'discarded-call'
  | 'assignment'
  | 'property-assignment'
  | 'increment'
  | 'decrement'
  | 'delete'
  | 'api-command';

export interface SourceLocation {
  filePath: string;
  start: { line: number; column: number };
  end: { line: number; column: number };
}
export interface Distance {
  /** Legacy aggregate line distance, retained for V1-V3 consumers. */
  line: number;
  /** Lines between a command and the declaration of its resource. */
  declarationLine: number;
  /** Caller-local offsets from function starts to command/call sites. */
  sameFunction: number;
  scope: number;
  functionCall: number;
  file: number;
  /** Folder-boundary crossings. Optional for structural compatibility with V1 consumers. */
  folder?: number;
}
export type ScoreFactor =
  | 'base'
  | 'legacy-line-distance'
  | 'declaration-line-distance'
  | 'function-call-distance'
  | 'scope-crossings'
  | 'file-crossings'
  | 'folder-crossings'
  | 'same-function-distance'
  | 'function-size';
export interface ScoreContribution {
  factor: ScoreFactor;
  value: number;
  /** `origin` for the command itself; otherwise the caller function id. */
  layer: string;
  distance?: number;
  weight?: number;
}
export interface ScoreBreakdown {
  base: number;
  /** V1-V3 call-site-to-definition line scoring, when enabled. */
  legacyLineDistance: number;
  declarationLineDistance: number;
  functionCallDistance: number;
  scopeCrossings: number;
  fileCrossings: number;
  /** Folder-boundary score. Optional for structural compatibility with V1 consumers. */
  folderCrossings?: number;
  sameFunctionDistance: number;
  functionSize: number;
  total: number;
  /** Ordered, additive evidence; inherited layers are prepended caller-first. */
  contributions: ScoreContribution[];
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
  scoreBreakdown: ScoreBreakdown;
  resource?: string;
  /** Stable API name supplied by the recognizer for API commands. */
  api?: string;
  /** Name of the recognizer that identified the API command. */
  recognizer?: string;
  declaration?: Declaration;
  remote: boolean;
  /** An unavoidable command excluded from limits, while remaining visible to consumers. */
  allowed?: 'jsx-event-handler';
}
export interface FunctionAnalysis {
  functionId: string;
  name: string;
  location: SourceLocation;
  size: number;
  commands: Command[];
  score: number;
  /** True when maxCommandsPerFunction truncated materialized command paths. */
  truncated?: boolean;
}
export interface FileAnalysis {
  filePath: string;
  functions: FunctionAnalysis[];
  commands: Command[];
  score: number;
  /** True when at least one function has incomplete command propagation. */
  truncated?: boolean;
}
export interface ProjectAnalysis {
  rootDir: string;
  files: FileAnalysis[];
  score: number;
  /** True when configured limits made the project analysis incomplete. */
  truncated?: boolean;
}

export interface ScoringConfig {
  baseScores: Record<CommandKind, number>;
  /** Optional exact API-name overrides for api-command base scores. */
  apiBaseScores: Record<string, number>;
  declarationLineDistanceWeight: number;
  sameFunctionDistanceWeight: number;
  scopeCrossingWeight: number;
  fileCrossingWeight: number;
  /** Folder-boundary weight. Optional for structural compatibility with V1-V4 consumers. */
  folderCrossingWeight?: number;
  /** @deprecated Alias of declarationLineDistanceWeight. */
  lineDistanceWeight: number;
  /** @deprecated Alias of scopeCrossingWeight. */
  scopeDistanceWeight: number;
  functionCallDistanceWeight: number;
  /** @deprecated Alias of fileCrossingWeight. */
  fileDistanceWeight: number;
  functionSizeWeight: number;
}

export interface AnalysisOptions {
  scoring?: Partial<Omit<ScoringConfig, 'baseScores' | 'apiBaseScores'>> & {
    baseScores?: Partial<Record<CommandKind, number>>;
    apiBaseScores?: Record<string, number>;
  };
  extensions?: string[];
  exclude?: (string | RegExp)[];
  /** Programmatic extension point. These run before declarative and built-in recognizers. */
  recognizers?: CommandRecognizer[];
  /** JSON-friendly custom API command definitions, suitable for config files. */
  apiPatterns?: ApiCommandPattern[];
  /** Select built-in families. All families are enabled by default. */
  builtInRecognizers?: BuiltInRecognizerName[];
  /** Reuse an existing compiler program, such as the one supplied by typescript-eslint. */
  program?: ts.Program;
  /** Predictable upper bound for inherited call-chain expansion. */
  maxCallDepth?: number;
  /** Predictable upper bound for materialized commands in each analyzed function. */
  maxCommandsPerFunction?: number;
  /** Disable propagation across files while retaining checker-backed local analysis. */
  crossFileAnalysis?: boolean;
}

export const defaultScoring: ScoringConfig = {
  baseScores: {
    'discarded-call': 1,
    assignment: 2,
    'property-assignment': 3,
    increment: 2,
    decrement: 2,
    delete: 4,
    'api-command': 3,
  },
  apiBaseScores: {},
  declarationLineDistanceWeight: 0.1,
  sameFunctionDistanceWeight: 0,
  scopeCrossingWeight: 2,
  fileCrossingWeight: 0,
  folderCrossingWeight: 0,
  lineDistanceWeight: 0.1,
  scopeDistanceWeight: 2,
  functionCallDistanceWeight: 0,
  fileDistanceWeight: 0,
  functionSizeWeight: 0,
};

interface Scope {
  parent?: Scope;
  declarations: Map<string, Declaration>;
}
interface ImportBinding {
  moduleName: string;
  importedName: string;
  namespace: boolean;
}
interface CallSite {
  node: ts.CallExpression;
  location: SourceLocation;
  directCommandLocation?: SourceLocation;
  name: string;
  namespace?: string;
}
interface FunctionDraft extends FunctionAnalysis {
  sourceFile: ts.SourceFile;
  scopes: Map<ts.Node, Scope>;
  directCommands: Command[];
  calls: CallSite[];
  jsxEventHandler: boolean;
}
interface FileDraft {
  sourceFile: ts.SourceFile;
  functions: FunctionDraft[];
  imports: Map<string, ImportBinding>;
}

const defaultCompilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.Latest,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  jsx: ts.JsxEmit.Preserve,
  allowJs: true,
  skipLibCheck: true,
};
const memoryProgramCache = new Map<string, ts.Program>();

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
  return analyzeSources([{ filePath, sourceText }], options)[0];
}

export function analyzeProject(
  rootDir: string,
  options: AnalysisOptions = {},
): ProjectAnalysis {
  const absoluteRoot = path.resolve(rootDir);
  const extensions = options.extensions ?? ['.ts', '.tsx', '.js', '.jsx'];
  const fileNames = collectFiles(absoluteRoot, extensions, options.exclude ?? []);
  const configPath = ts.findConfigFile(absoluteRoot, ts.sys.fileExists);
  let program: ts.Program;
  if (configPath) {
    const config = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      path.dirname(configPath),
    );
    program = ts.createProgram({
      rootNames: [...new Set([...parsed.fileNames, ...fileNames])],
      options: parsed.options,
      projectReferences: parsed.projectReferences,
    });
  } else {
    program = ts.createProgram(fileNames, defaultCompilerOptions);
  }
  const files = analyzeProgram(program, { ...options, program }).files.filter(file =>
    fileNames.some(fileName => path.resolve(fileName) === path.resolve(file.filePath)),
  );
  return {
    rootDir: absoluteRoot,
    files,
    score: files.reduce((sum, file) => sum + file.score, 0),
    ...(files.some(file => file.truncated) ? { truncated: true } : {}),
  };
}

/** Analyze and reuse a compiler program without reparsing its source files. */
export function analyzeProgram(
  program: ts.Program,
  options: AnalysisOptions = {},
): ProjectAnalysis {
  const sourceFiles = program
    .getSourceFiles()
    .filter(
      source => !source.isDeclarationFile && !source.fileName.includes('/node_modules/'),
    );
  const files = analyzeSourceFiles(sourceFiles, program.getTypeChecker(), {
    ...options,
    program,
  });
  return {
    rootDir: program.getCurrentDirectory(),
    files,
    score: files.reduce((sum, file) => sum + file.score, 0),
    ...(files.some(file => file.truncated) ? { truncated: true } : {}),
  };
}

function analyzeSources(
  sources: Array<{ filePath: string; sourceText: string }>,
  options: AnalysisOptions,
): FileAnalysis[] {
  const program = options.program ?? createMemoryProgram(sources);
  const sourceFiles = sources.map(source => {
    const absolute = path.resolve(source.filePath);
    return (
      program.getSourceFile(source.filePath) ??
      program.getSourceFile(absolute) ??
      ts.createSourceFile(
        source.filePath,
        source.sourceText,
        ts.ScriptTarget.Latest,
        true,
        scriptKind(source.filePath),
      )
    );
  });
  return analyzeSourceFiles(sourceFiles, program.getTypeChecker(), options);
}

function analyzeSourceFiles(
  sourceFiles: ts.SourceFile[],
  checker: ts.TypeChecker,
  options: AnalysisOptions,
): FileAnalysis[] {
  const drafts = sourceFiles.map(sourceFile =>
    createFileDraft(sourceFile, options, checker),
  );
  const allFunctions = drafts.flatMap(file => file.functions);
  const byId = new Map(allFunctions.map(fn => [fn.functionId, fn]));
  const fileBySource = new Map(drafts.map(file => [file.sourceFile, file]));
  const edges = new Map<string, Array<{ callee: FunctionDraft; hop: CommandHop }>>();
  const resolvedCallStarts = new Map<string, Set<string>>();
  allFunctions.forEach(caller => {
    const callerFile = fileBySource.get(caller.sourceFile);
    if (!callerFile) return;
    caller.calls.forEach(call => {
      const callee = resolveCall(call, caller, callerFile, drafts, checker);
      if (!callee) return;
      if (options.crossFileAnalysis === false && callee.sourceFile !== caller.sourceFile)
        return;
      const distance = hopDistance(call, caller, callee);
      const hop: CommandHop = {
        caller: caller.functionId,
        callee: callee.functionId,
        callLocation: call.location,
        definitionLocation: callee.location,
        distance,
      };
      const callerEdges = edges.get(caller.functionId) ?? [];
      callerEdges.push({ callee, hop });
      edges.set(caller.functionId, callerEdges);
      const starts = resolvedCallStarts.get(caller.functionId) ?? new Set<string>();
      starts.add(locationStartKey(call.location));
      if (call.directCommandLocation)
        starts.add(locationStartKey(call.directCommandLocation));
      resolvedCallStarts.set(caller.functionId, starts);
    });
  });
  const scoring = scoringConfig(options);
  const cyclicOrReachable = functionsReachingCycles(edges, allFunctions);
  const expansionCache = new Map<string, { commands: Command[]; truncated: boolean }>();
  allFunctions.forEach(fn => {
    const resolved = resolvedCallStarts.get(fn.functionId);
    if (resolved)
      fn.directCommands = fn.directCommands.filter(
        command => !resolved.has(locationStartKey(command.location)),
      );
  });
  allFunctions.forEach(fn => {
    const expansion = expandCommands(
      fn,
      edges,
      byId,
      scoring,
      new Set(),
      0,
      options.maxCallDepth ?? 50,
      options.maxCommandsPerFunction ?? 10_000,
      cyclicOrReachable,
      expansionCache,
    );
    fn.commands = expansion.commands;
    fn.truncated = expansion.truncated;
    applyJsxEventHandlerAllowance(fn);
    fn.score = fn.commands.reduce(
      (sum, command) => sum + (command.allowed ? 0 : command.score),
      0,
    );
  });
  return drafts.map(draft => {
    const functions: FunctionAnalysis[] = draft.functions.map(stripFunctionDraft);
    const commands = functions.flatMap(fn => fn.commands);
    const truncated = functions.some(fn => fn.truncated);
    return {
      filePath: draft.sourceFile.fileName,
      functions,
      commands,
      score: functions.reduce((sum, fn) => sum + fn.score, 0),
      ...(truncated ? { truncated: true } : {}),
    };
  });
}

function createFileDraft(
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
  visitFunctions(
    sourceFile,
    sourceFile,
    scopes,
    options,
    recognizers,
    recognitionContext,
    checker,
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
      jsxEventHandler: isJsxEventHandler(node),
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
    line: resolution
      ? Math.abs(location.start.line - resolution.declaration.location.start.line)
      : 0,
    declarationLine: resolution
      ? Math.abs(location.start.line - resolution.declaration.location.start.line)
      : 0,
    sameFunction: Math.max(0, location.start.line - locationOfFunctionStart(functionId)),
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
    ...(resolution ? { declaration: resolution.declaration } : {}),
    remote: Boolean(resource && (!resolution || resolution.scopeDistance > 0)),
  };
}

function expandCommands(
  fn: FunctionDraft,
  edges: Map<string, Array<{ callee: FunctionDraft; hop: CommandHop }>>,
  functions: Map<string, FunctionDraft>,
  scoring: ScoringConfig,
  ancestors: Set<string>,
  depth: number,
  maxDepth: number,
  maxCommands: number,
  cyclicOrReachable: Set<string>,
  cache: Map<string, { commands: Command[]; truncated: boolean }>,
): { commands: Command[]; truncated: boolean } {
  if (ancestors.has(fn.functionId)) return { commands: [], truncated: false };
  if (depth > maxDepth) return { commands: [], truncated: true };
  const cacheKey = `${fn.functionId}\0${maxDepth - depth}\0${maxCommands}`;
  if (!cyclicOrReachable.has(fn.functionId)) {
    const cached = cache.get(cacheKey);
    if (cached) return cached;
  }
  const nextAncestors = new Set(ancestors).add(fn.functionId);
  let descendantTruncated = false;
  const expanded = fn.directCommands.slice(0, maxCommands);
  let truncated = fn.directCommands.length > maxCommands;
  for (const { callee, hop } of edges.get(fn.functionId) ?? []) {
    if (expanded.length >= maxCommands) {
      truncated = true;
      break;
    }
    const target = functions.get(callee.functionId);
    if (!target || nextAncestors.has(target.functionId)) continue;
    const expansion = expandCommands(
      target,
      edges,
      functions,
      scoring,
      nextAncestors,
      depth + 1,
      maxDepth,
      maxCommands - expanded.length,
      cyclicOrReachable,
      cache,
    );
    descendantTruncated ||= expansion.truncated;
    for (const command of expansion.commands) {
      if (expanded.length >= maxCommands) {
        truncated = true;
        break;
      }
      expanded.push(inheritCommand(command, hop, scoring));
    }
  }
  const result = { commands: expanded, truncated: truncated || descendantTruncated };
  if (!cyclicOrReachable.has(fn.functionId)) cache.set(cacheKey, result);
  return result;
}

function functionsReachingCycles(
  edges: Map<string, Array<{ callee: FunctionDraft }>>,
  functions: FunctionDraft[],
): Set<string> {
  const unsafe = new Set<string>();
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  const visit = (id: string): boolean => {
    if (visiting.has(id)) {
      stack.slice(stack.indexOf(id)).forEach(item => unsafe.add(item));
      return true;
    }
    if (visited.has(id)) return unsafe.has(id);
    visiting.add(id);
    stack.push(id);
    let reaches = false;
    for (const edge of edges.get(id) ?? [])
      reaches = visit(edge.callee.functionId) || reaches;
    stack.pop();
    visiting.delete(id);
    visited.add(id);
    if (reaches) unsafe.add(id);
    return reaches;
  };
  functions.forEach(fn => visit(fn.functionId));
  return unsafe;
}

function inheritCommand(
  command: Command,
  hop: CommandHop,
  scoring: ScoringConfig,
): Command {
  const scoreBreakdown = inheritScoreBreakdown(command.scoreBreakdown, hop, scoring);
  return {
    ...command,
    callPath: [hop, ...command.callPath],
    distance: addDistance(command.distance, hop.distance),
    scoreBreakdown,
    score: scoreBreakdown.total,
  };
}

function resolveCall(
  call: CallSite,
  caller: FunctionDraft,
  callerFile: FileDraft,
  files: FileDraft[],
  checker: ts.TypeChecker,
): FunctionDraft | undefined {
  const declaration = checker.getResolvedSignature(call.node)?.declaration;
  const declarationFunction = declaration && enclosingFunction(declaration);
  if (declarationFunction) {
    const declarationFile = declarationFunction.getSourceFile();
    const start = locationOf(declarationFunction, declarationFile).start;
    const resolved = files
      .find(file => file.sourceFile === declarationFile)
      ?.functions.find(
        fn =>
          fn.location.start.line === start.line &&
          fn.location.start.column === start.column,
      );
    if (resolved) return resolved;
  }
  if (call.namespace) {
    const binding = callerFile.imports.get(call.namespace);
    if (!binding?.namespace) return undefined;
    return resolveImportedFunction(binding.moduleName, call.name, callerFile, files);
  }
  const imported = callerFile.imports.get(call.name);
  if (imported && !imported.namespace)
    return resolveImportedFunction(
      imported.moduleName,
      imported.importedName,
      callerFile,
      files,
    );
  const resolution = resolveDeclaration(call.name, caller.scopes.get(call.node));
  const candidates = callerFile.functions.filter(
    candidate => candidate.name === call.name,
  );
  if (!resolution) return candidates.length === 1 ? candidates[0] : undefined;
  return (
    candidates.find(
      candidate =>
        candidate.location.start.line === resolution.declaration.location.start.line,
    ) ?? (candidates.length === 1 ? candidates[0] : undefined)
  );
}

function resolveImportedFunction(
  moduleName: string,
  importedName: string,
  callerFile: FileDraft,
  files: FileDraft[],
): FunctionDraft | undefined {
  const target = resolveModuleFile(moduleName, callerFile.sourceFile.fileName, files);
  if (!target) return undefined;
  if (importedName === 'default') {
    const defaultName = defaultExportName(target.sourceFile);
    if (defaultName) return target.functions.find(fn => fn.name === defaultName);
    return target.functions.length === 1 ? target.functions[0] : undefined;
  }
  return target.functions.find(
    fn => fn.name === exportedName(target.sourceFile, importedName),
  );
}

function resolveModuleFile(
  moduleName: string,
  callerPath: string,
  files: FileDraft[],
): FileDraft | undefined {
  if (!moduleName.startsWith('.')) return undefined;
  const requested = path.resolve(path.dirname(callerPath), moduleName);
  const requestedExtension = path.extname(requested);
  const requestedStem = ['.ts', '.tsx', '.js', '.jsx'].includes(requestedExtension)
    ? requested.slice(0, -requestedExtension.length)
    : requested;
  return files.find(file => {
    const filePath = path.resolve(file.sourceFile.fileName);
    const extension = path.extname(filePath);
    return (
      filePath === requested ||
      filePath.slice(0, -extension.length) === requestedStem ||
      (path.dirname(filePath) === requested &&
        path.basename(filePath, extension) === 'index')
    );
  });
}

function collectImports(sourceFile: ts.SourceFile): Map<string, ImportBinding> {
  const imports = new Map<string, ImportBinding>();
  sourceFile.statements.forEach(statement => {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    )
      return;
    const moduleName = statement.moduleSpecifier.text;
    const clause = statement.importClause;
    if (!clause) return;
    if (clause.name)
      imports.set(clause.name.text, {
        moduleName,
        importedName: 'default',
        namespace: false,
      });
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings))
      imports.set(bindings.name.text, { moduleName, importedName: '*', namespace: true });
    else if (bindings)
      bindings.elements.forEach(element =>
        imports.set(element.name.text, {
          moduleName,
          importedName: element.propertyName?.text ?? element.name.text,
          namespace: false,
        }),
      );
  });
  return imports;
}

function configuredRecognizers(options: AnalysisOptions): readonly CommandRecognizer[] {
  const enabled = options.builtInRecognizers
    ? new Set(options.builtInRecognizers)
    : undefined;
  return [
    ...(options.recognizers ?? []),
    ...(options.apiPatterns ?? []).map(patternRecognizer),
    ...builtInRecognizers.filter(
      recognizer => !enabled || enabled.has(recognizer.name as BuiltInRecognizerName),
    ),
  ];
}

function createRecognitionContext(
  sourceFile: ts.SourceFile,
  imports: Map<string, ImportBinding>,
  scopes: Map<ts.Node, Scope>,
): CommandRecognitionContext {
  return {
    sourceFile,
    importSource(localName) {
      return imports.get(localName)?.moduleName;
    },
    declarationInitializer(name, from) {
      const resolution = resolveDeclaration(name, scopes.get(from));
      if (!resolution) return undefined;
      const declarationStart = locationStartKey(resolution.declaration.location);
      let initializer: ts.Expression | undefined;
      const visit = (node: ts.Node): void => {
        if (initializer) return;
        if (ts.isVariableDeclaration(node) && node.initializer) {
          const declarationNode = bindingDeclarationNode(node.name, name, node);
          if (
            declarationNode &&
            locationStartKey(locationOf(declarationNode, sourceFile)) === declarationStart
          )
            initializer = node.initializer;
        }
        ts.forEachChild(node, visit);
      };
      visit(sourceFile);
      return initializer;
    },
  };
}

function bindingDeclarationNode(
  binding: ts.BindingName,
  name: string,
  declarationNode: ts.Node,
): ts.Node | undefined {
  if (ts.isIdentifier(binding))
    return binding.text === name ? declarationNode : undefined;
  for (const element of binding.elements) {
    if (!ts.isBindingElement(element)) continue;
    const found = bindingDeclarationNode(element.name, name, element);
    if (found) return found;
  }
  return undefined;
}

function exportedName(sourceFile: ts.SourceFile, exported: string): string {
  for (const statement of sourceFile.statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      !statement.exportClause ||
      !ts.isNamedExports(statement.exportClause)
    )
      continue;
    const match = statement.exportClause.elements.find(
      element => element.name.text === exported,
    );
    if (match) return match.propertyName?.text ?? match.name.text;
  }
  return exported;
}

function defaultExportName(sourceFile: ts.SourceFile): string | undefined {
  for (const statement of sourceFile.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name &&
      hasModifier(statement, ts.SyntaxKind.DefaultKeyword)
    )
      return statement.name.text;
    if (ts.isExportAssignment(statement) && ts.isIdentifier(statement.expression))
      return statement.expression.text;
  }
  return undefined;
}

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return Boolean(
    ts.getModifiers(node as ts.HasModifiers)?.some(modifier => modifier.kind === kind),
  );
}

function hopDistance(
  call: CallSite,
  caller: FunctionDraft,
  callee: FunctionDraft,
): Distance {
  const sameFile = caller.sourceFile.fileName === callee.sourceFile.fileName;
  const folder = folderDistance(
    path.dirname(path.resolve(caller.sourceFile.fileName)),
    path.dirname(path.resolve(callee.sourceFile.fileName)),
  );
  const resolution = resolveDeclaration(
    call.namespace ?? call.name,
    caller.scopes.get(call.node),
  );
  return {
    line: sameFile ? Math.abs(call.location.start.line - callee.location.start.line) : 0,
    declarationLine: 0,
    sameFunction: Math.max(0, call.location.start.line - caller.location.start.line),
    scope: resolution?.scopeDistance ?? 0,
    functionCall: 1,
    file: sameFile ? 0 : 1,
    folder,
  };
}

function folderDistance(left: string, right: string): number {
  const leftParts = left.split(path.sep).filter(Boolean);
  const rightParts = right.split(path.sep).filter(Boolean);
  let shared = 0;
  while (leftParts[shared] === rightParts[shared] && shared < leftParts.length) shared++;
  return leftParts.length + rightParts.length - shared * 2;
}

function stripFunctionDraft(fn: FunctionDraft): FunctionAnalysis {
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

function applyJsxEventHandlerAllowance(fn: FunctionDraft): void {
  if (!fn.jsxEventHandler || fn.commands.length === 0) return;
  const highest = fn.commands.reduce((left, right) =>
    right.score > left.score ? right : left,
  );
  highest.allowed = 'jsx-event-handler';
}

function isJsxEventHandler(node: ts.FunctionLikeDeclaration): boolean {
  let parent: ts.Node | undefined = node.parent;
  while (parent && isOuterExpression(parent)) parent = parent.parent;
  if (!parent || !ts.isJsxExpression(parent) || !ts.isJsxAttribute(parent.parent))
    return false;
  return /^on[A-Z]/.test(parent.parent.name.getText());
}

function enclosingFunction(node: ts.Node): ts.FunctionLikeDeclaration | undefined {
  let current: ts.Node | undefined = node;
  while (current) {
    if (isFunction(current)) return current;
    current = current.parent;
  }
  return undefined;
}

function detectCommand(
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

function isOuterExpression(
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

function callTarget(
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

function directCallCommandLocation(
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
  if (ts.isPropertyAccessExpression(expression))
    return resourceName(expression.expression);
  if (ts.isElementAccessExpression(expression))
    return resourceName(expression.expression);
  if (ts.isParenthesizedExpression(expression))
    return resourceName(expression.expression);
  return undefined;
}

function addDistance(left: Distance, right: Distance): Distance {
  return {
    line: left.line + right.line,
    declarationLine: left.declarationLine + right.declarationLine,
    sameFunction: left.sameFunction + right.sameFunction,
    scope: left.scope + right.scope,
    functionCall: left.functionCall + right.functionCall,
    file: left.file + right.file,
    folder: (left.folder ?? 0) + (right.folder ?? 0),
  };
}

function locationStartKey(location: SourceLocation): string {
  return `${location.start.line}:${location.start.column}`;
}

function locationOfFunctionStart(functionId: string): number {
  const match = functionId.match(/@(\d+)$/);
  return match ? Number(match[1]) : 1;
}

function contribution(
  factor: ScoreFactor,
  layer: string,
  distance: number,
  weight: number,
): ScoreContribution {
  return { factor, layer, distance, weight, value: distance * weight };
}

function directScoreBreakdown(
  kind: CommandKind,
  api: string | undefined,
  distance: Distance,
  functionSize: number,
  scoring: ScoringConfig,
): ScoreBreakdown {
  const base = api
    ? scoring.apiBaseScores[api] ?? scoring.baseScores[kind]
    : scoring.baseScores[kind];
  const contributions: ScoreContribution[] = [
    { factor: 'base', layer: 'origin', value: base },
    contribution(
      'declaration-line-distance',
      'origin',
      distance.declarationLine,
      scoring.declarationLineDistanceWeight,
    ),
    contribution(
      'scope-crossings',
      'origin',
      distance.scope,
      scoring.scopeCrossingWeight,
    ),
    contribution(
      'same-function-distance',
      'origin',
      distance.sameFunction,
      scoring.sameFunctionDistanceWeight,
    ),
    contribution('function-size', 'origin', functionSize, scoring.functionSizeWeight),
  ];
  return breakdownFrom(contributions);
}

function hopContributions(hop: CommandHop, scoring: ScoringConfig): ScoreContribution[] {
  const contributions = [
    contribution(
      'function-call-distance',
      hop.caller,
      hop.distance.functionCall,
      scoring.functionCallDistanceWeight,
    ),
    contribution(
      'scope-crossings',
      hop.caller,
      hop.distance.scope,
      scoring.scopeCrossingWeight,
    ),
    contribution(
      'file-crossings',
      hop.caller,
      hop.distance.file,
      scoring.fileCrossingWeight,
    ),
    contribution(
      'folder-crossings',
      hop.caller,
      hop.distance.folder ?? 0,
      scoring.folderCrossingWeight ?? 0,
    ),
    contribution(
      'same-function-distance',
      hop.caller,
      hop.distance.sameFunction,
      scoring.sameFunctionDistanceWeight,
    ),
  ];
  if (scoring.lineDistanceWeight)
    contributions.push(
      contribution(
        'legacy-line-distance',
        hop.caller,
        hop.distance.line,
        scoring.lineDistanceWeight,
      ),
    );
  return contributions;
}

function inheritScoreBreakdown(
  breakdown: ScoreBreakdown,
  hop: CommandHop,
  scoring: ScoringConfig,
): ScoreBreakdown {
  return breakdownFrom([...hopContributions(hop, scoring), ...breakdown.contributions]);
}

function breakdownFrom(contributions: ScoreContribution[]): ScoreBreakdown {
  const sum = (factor: ScoreFactor): number =>
    contributions
      .filter(item => item.factor === factor)
      .reduce((total, item) => total + item.value, 0);
  return {
    base: sum('base'),
    legacyLineDistance: sum('legacy-line-distance'),
    declarationLineDistance: sum('declaration-line-distance'),
    functionCallDistance: sum('function-call-distance'),
    scopeCrossings: sum('scope-crossings'),
    fileCrossings: sum('file-crossings'),
    folderCrossings: sum('folder-crossings'),
    sameFunctionDistance: sum('same-function-distance'),
    functionSize: sum('function-size'),
    total: contributions.reduce((total, item) => total + item.value, 0),
    contributions,
  };
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
  const supplied = options.scoring ?? {};
  const declarationLineDistanceWeight =
    supplied.declarationLineDistanceWeight ??
    supplied.lineDistanceWeight ??
    defaultScoring.declarationLineDistanceWeight;
  const scopeCrossingWeight =
    supplied.scopeCrossingWeight ??
    supplied.scopeDistanceWeight ??
    defaultScoring.scopeCrossingWeight;
  const fileCrossingWeight =
    supplied.fileCrossingWeight ??
    supplied.fileDistanceWeight ??
    defaultScoring.fileCrossingWeight;
  return {
    ...defaultScoring,
    ...supplied,
    declarationLineDistanceWeight,
    scopeCrossingWeight,
    fileCrossingWeight,
    lineDistanceWeight: supplied.lineDistanceWeight ?? defaultScoring.lineDistanceWeight,
    baseScores: { ...defaultScoring.baseScores, ...supplied.baseScores },
    apiBaseScores: { ...defaultScoring.apiBaseScores, ...supplied.apiBaseScores },
  };
}

function createMemoryProgram(
  sources: Array<{ filePath: string; sourceText: string }>,
): ts.Program {
  const cacheKey = sources
    .map(source => `${source.filePath}\0${source.sourceText}`)
    .join('\0\0');
  const cached = memoryProgramCache.get(cacheKey);
  if (cached) return cached;
  const host = ts.createCompilerHost(defaultCompilerOptions, true);
  const sourceByPath = new Map<string, { filePath: string; sourceText: string }>();
  sources.forEach(source => {
    sourceByPath.set(source.filePath, source);
    sourceByPath.set(path.resolve(source.filePath), source);
  });
  const originalGetSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
    const source = sourceByPath.get(fileName) ?? sourceByPath.get(path.resolve(fileName));
    return source
      ? ts.createSourceFile(
          source.filePath,
          source.sourceText,
          languageVersion,
          true,
          scriptKind(source.filePath),
        )
      : originalGetSourceFile(fileName, languageVersion, onError, shouldCreate);
  };
  const originalFileExists = host.fileExists.bind(host);
  const originalReadFile = host.readFile.bind(host);
  host.fileExists = fileName =>
    sourceByPath.has(fileName) ||
    sourceByPath.has(path.resolve(fileName)) ||
    originalFileExists(fileName);
  host.readFile = fileName =>
    (sourceByPath.get(fileName) ?? sourceByPath.get(path.resolve(fileName)))
      ?.sourceText ?? originalReadFile(fileName);
  const program = ts.createProgram(
    sources.map(source => source.filePath),
    defaultCompilerOptions,
    host,
  );
  memoryProgramCache.set(cacheKey, program);
  if (memoryProgramCache.size > 5)
    memoryProgramCache.delete(memoryProgramCache.keys().next().value as string);
  return program;
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
