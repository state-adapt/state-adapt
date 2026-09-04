import {
  analyzeProgram,
  AnalysisOptions,
  FileAnalysis,
} from '@state-adapt/spaghetti-core';
import { Rule } from 'eslint';
import { RuleOptions } from './types';
import { commandPolicy } from './policy';
import { numberOption } from './reporting';

const cacheByProgram = new WeakMap<object, Map<string, FileAnalysis[]>>();

function analysisOptions(options: RuleOptions): AnalysisOptions {
  const builtIns = options['builtInRecognizers'];
  const policy = commandPolicy(options);
  return {
    ...(options.apis ? { apis: options.apis } : {}),
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
      externalPenalty: numberOption(options, 'externalPenalty', 100),
      declarationLineDistanceWeight: numberOption(
        options,
        'declarationLineDistanceWeight',
        1,
      ),
      sameFunctionDistanceWeight: 0,
      scopeCrossingWeight: numberOption(options, 'scopeWeight', 1),
      fileCrossingWeight: numberOption(options, 'fileWeight', 30),
      folderCrossingWeight: numberOption(options, 'folderWeight', 15),
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
