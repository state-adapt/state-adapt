import {
  analyzeProgram,
  AnalysisOptions,
  FileAnalysis,
} from '@state-adapt/spaghetti-core';
import { Rule } from 'eslint';
import { RuleOptions } from './types';
import { commandPolicy } from './policy';

const cacheByProgram = new WeakMap<object, Map<string, FileAnalysis[]>>();

function analysisOptions(options: RuleOptions): AnalysisOptions {
  const apis = options.apis ?? [];
  const builtIns = options['builtInRecognizers'];
  const policy = commandPolicy(options);
  const apiPatterns = apis.filter(
    api =>
      api.methods !== undefined || api.functions !== undefined || api.calls !== undefined,
  ) as NonNullable<AnalysisOptions['apiPatterns']>;
  const ignoredApis = [...policy.apiPenalties]
    .filter(([, penalty]) => penalty === 0)
    .map(([name]) => name);
  const apiBaseScores = Object.fromEntries(
    [...policy.apiPenalties].filter(([, penalty]) => penalty > 0),
  );
  return {
    ...(apiPatterns.length > 0 ? { apiPatterns } : {}),
    ...(ignoredApis.length > 0 ? { ignoredApis } : {}),
    ...(Array.isArray(builtIns)
      ? { builtInRecognizers: builtIns as AnalysisOptions['builtInRecognizers'] }
      : {}),
    ...(typeof options['maxCallDepth'] === 'number'
      ? { maxCallDepth: options['maxCallDepth'] }
      : {}),
    ...(typeof options['maxCommandsPerFunction'] === 'number'
      ? { maxCommandsPerFunction: options['maxCommandsPerFunction'] }
      : {}),
    crossFileAnalysis: options['crossFileAnalysis'] !== false,
    maxCallBoundaryScore: policy.maxScore,
    scoring: {
      baseScores: {
        'discarded-call': 0,
        assignment: 0,
        'property-assignment': 0,
        increment: 0,
        decrement: 0,
        delete: 0,
        'api-command': 0,
      },
      apiBaseScores,
      declarationLineDistanceWeight: policy.weights.declarationLine,
      sameFunctionDistanceWeight: 0,
      scopeCrossingWeight: policy.weights.scope,
      fileCrossingWeight: policy.weights.file,
      folderCrossingWeight: policy.weights.folder,
      functionCallDistanceWeight: 0,
      functionSizeWeight: 0,
    },
  };
}

export function analysisForLintFile(
  source: Rule.RuleContext['sourceCode'],
  fileName: string,
  options: RuleOptions,
): FileAnalysis {
  const parserServices = source.parserServices as
    | { program?: { getSourceFiles(): unknown[] } }
    | undefined;
  const program = parserServices?.program;
  if (!program)
    throw new Error(
      'eslint-plugin-spaghetti requires type-aware parser services. Configure @typescript-eslint/parser with parserOptions.project.',
    );

  const configured = analysisOptions(options);
  const cacheKey = JSON.stringify(configured);
  let cache = cacheByProgram.get(program);
  if (!cache) {
    cache = new Map();
    cacheByProgram.set(program, cache);
  }
  let files = cache.get(cacheKey);
  if (!files) {
    files = analyzeProgram(program as never, configured).files;
    cache.set(cacheKey, files);
  }
  const normalized = fileName.replace(/\\/g, '/');
  const match = files.find(file => file.filePath.replace(/\\/g, '/') === normalized);
  if (!match)
    throw new Error(
      `eslint-plugin-spaghetti could not find ${fileName} in the configured TypeScript project.`,
    );
  return match;
}
