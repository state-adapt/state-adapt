import {
  analyzeProgram,
  AnalysisOptions,
  FileAnalysis,
} from '@state-adapt/spaghetti-core';
import { Rule } from 'eslint';
import { RuleOptions } from './types';

const cacheByProgram = new WeakMap<object, Map<string, FileAnalysis[]>>();

function analysisOptions(options: RuleOptions): AnalysisOptions {
  const scoring = options['scoring'];
  const apiPatterns = options['apiPatterns'];
  const builtIns = options['builtInRecognizers'];
  return {
    ...(scoring && typeof scoring === 'object'
      ? { scoring: scoring as AnalysisOptions['scoring'] }
      : {}),
    ...(Array.isArray(apiPatterns)
      ? { apiPatterns: apiPatterns as AnalysisOptions['apiPatterns'] }
      : {}),
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
