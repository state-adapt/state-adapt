import * as path from 'node:path';
import * as ts from 'typescript';
import {
  AnalysisOptions,
  Command,
  CommandHop,
  FileAnalysis,
  FunctionAnalysis,
  ProjectAnalysis,
} from './models';
import { FunctionDraft } from './internal-types';
import {
  collectFiles,
  createMemoryProgram,
  defaultCompilerOptions,
  scriptKind,
} from './compiler';
import { createFileDraft } from './source-collection';
import { hopDistance, resolveCall } from './call-resolution';
import { expandCommands, functionsReachingCycles } from './graph';
import { scoringConfig, locationStartKey } from './scoring';
import { stripFunctionDraft } from './jsx-context';

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
  const analyzedFiles = new Set(sourceFiles);
  const drafts = sourceFiles.map(sourceFile =>
    createFileDraft(sourceFile, options, checker, analyzedFiles),
  );
  const allFunctions = drafts.flatMap(file => file.functions);
  const byId = new Map(allFunctions.map(fn => [fn.functionId, fn]));
  const fileBySource = new Map(drafts.map(file => [file.sourceFile, file]));
  const edges = new Map<string, Array<{ callee: FunctionDraft; hop: CommandHop }>>();
  const resolvedCallStarts = new Map<string, Set<string>>();
  const scoring = scoringConfig(options);
  allFunctions.forEach(caller => {
    const callerFile = fileBySource.get(caller.sourceFile);
    if (!callerFile) return;
    caller.calls.forEach(call => {
      const callee = resolveCall(call, caller, callerFile, drafts, checker);
      if (!callee) return;
      if (options.crossFileAnalysis === false && callee.sourceFile !== caller.sourceFile)
        return;
      const distance = hopDistance(call, caller, callee);
      if (
        options.maxCallBoundaryScore !== undefined &&
        hasDirectDiscardedCall(caller, call) &&
        weightedCallBoundary(distance, scoring) > options.maxCallBoundaryScore
      )
        return;
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
    fn.score = fn.commands.reduce((sum, command) => sum + command.score, 0);
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

function hasDirectDiscardedCall(
  caller: FunctionDraft,
  call: FunctionDraft['calls'][number],
): boolean {
  const starts = new Set([locationStartKey(call.location)]);
  if (call.directCommandLocation)
    starts.add(locationStartKey(call.directCommandLocation));
  return caller.directCommands.some(
    command =>
      command.kind === 'discarded-call' && starts.has(locationStartKey(command.location)),
  );
}

function weightedCallBoundary(
  distance: CommandHop['distance'],
  scoring: ReturnType<typeof scoringConfig>,
): number {
  return (
    distance.declarationLine * scoring.declarationLineDistanceWeight +
    distance.scope * scoring.scopeCrossingWeight +
    distance.file * scoring.fileCrossingWeight +
    distance.folder * scoring.folderCrossingWeight
  );
}
