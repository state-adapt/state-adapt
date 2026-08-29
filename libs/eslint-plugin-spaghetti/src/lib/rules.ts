import {
  analyzeProgram,
  AnalysisOptions,
  Command,
  FileAnalysis,
  FunctionAnalysis,
} from '@state-adapt/spaghetti-core';
import { Rule } from 'eslint';

type Options = Record<string, unknown>;
type Check = (
  context: Rule.RuleContext,
  options: Options,
  functions: FunctionAnalysis[],
) => void;

const programAnalysisCache = new WeakMap<object, Map<string, FileAnalysis[]>>();

function createRule(
  description: string,
  schema: Rule.RuleMetaData['schema'],
  check: Check,
): Rule.RuleModule {
  return {
    meta: {
      type: 'suggestion',
      docs: { description },
      schema,
      messages: {
        functionLimit:
          '{{name}} has {{actual}}, above the configured maximum of {{max}}.',
        distanceLimit:
          '{{kind}} command distance is {{actual}}, above the configured maximum of {{max}}.',
        remoteMutation:
          '{{kind}} mutates remote resource {{resource}} (declared {{distance}} scope(s) away).',
        analysisTruncated:
          '{{name}} has incomplete analysis because a configured graph limit was reached.',
      },
    },
    create(context) {
      return {
        'Program:exit'() {
          const options = (context.options[0] ?? {}) as Options;
          const source = context.getSourceCode();
          const fileName =
            context.getFilename() === '<input>' ? 'source.ts' : context.getFilename();
          const analysis = analysisForLintFile(source, fileName, options);
          analysis.functions
            .filter(fn => fn.truncated)
            .forEach(fn =>
              context.report({
                loc: eslintLocation(fn.location),
                messageId: 'analysisTruncated',
                data: { name: fn.name },
              }),
            );
          check(context, options, analysis.functions);
        },
      };
    },
  };
}

const scoringSchema: Record<string, unknown> = {
  type: 'object',
  properties: {
    declarationLineDistanceWeight: { type: 'number', minimum: 0 },
    sameFunctionDistanceWeight: { type: 'number', minimum: 0 },
    scopeCrossingWeight: { type: 'number', minimum: 0 },
    fileCrossingWeight: { type: 'number', minimum: 0 },
    folderCrossingWeight: { type: 'number', minimum: 0 },
    lineDistanceWeight: { type: 'number', minimum: 0 },
    scopeDistanceWeight: { type: 'number', minimum: 0 },
    functionCallDistanceWeight: { type: 'number', minimum: 0 },
    fileDistanceWeight: { type: 'number', minimum: 0 },
    functionSizeWeight: { type: 'number', minimum: 0 },
    baseScores: {
      type: 'object',
      additionalProperties: { type: 'number', minimum: 0 },
    },
    apiBaseScores: {
      type: 'object',
      additionalProperties: { type: 'number', minimum: 0 },
    },
  },
  additionalProperties: false,
};

const recognitionSchema: Record<string, unknown> = {
  apiPatterns: {
    type: 'array',
    items: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1 },
        methods: { type: 'array', items: { type: 'string' }, minItems: 1 },
        functions: { type: 'array', items: { type: 'string' }, minItems: 1 },
        receiverNames: { type: 'array', items: { type: 'string' } },
        importSources: { type: 'array', items: { type: 'string' } },
        resource: { enum: ['receiver', 'argument'] },
        argumentIndex: { type: 'integer', minimum: 0 },
      },
      oneOf: [{ required: ['methods'] }, { required: ['functions'] }],
      additionalProperties: false,
    },
  },
  builtInRecognizers: {
    type: 'array',
    uniqueItems: true,
    items: {
      enum: ['javascript', 'dom', 'redux'],
    },
  },
};

const maxSchema = [
  {
    type: 'object',
    properties: {
      max: { type: 'number', minimum: 0 },
      scoring: scoringSchema,
      crossFileAnalysis: { type: 'boolean' },
      maxCallDepth: { type: 'integer', minimum: 0 },
      maxCommandsPerFunction: { type: 'integer', minimum: 1 },
      ...recognitionSchema,
    },
    additionalProperties: false,
  },
];

function reportFunction(
  context: Rule.RuleContext,
  fn: FunctionAnalysis,
  actual: number,
  max: number,
): void {
  context.report({
    loc: eslintLocation(fn.location),
    messageId: 'functionLimit',
    data: { name: fn.name, actual: format(actual), max: format(max) },
  });
}

function reportCommand(
  context: Rule.RuleContext,
  command: Command,
  messageId: 'distanceLimit' | 'remoteMutation',
  data: Record<string, string>,
): void {
  context.report({
    loc: eslintLocation(command.callPath[0]?.callLocation ?? command.location),
    messageId,
    data,
  });
}

const maxSpaghettiScore = createRule(
  'limit the spaghetti score of a function and its downstream commands',
  maxSchema,
  (context, options, functions) => {
    const max = numberOption(options, 'max', 10);
    functions
      .filter(fn => fn.score > max)
      .forEach(fn => reportFunction(context, fn, fn.score, max));
  },
);

const maxCommands = createRule(
  'limit the number of commands caused by a function',
  maxSchema,
  (context, options, functions) => {
    const max = numberOption(options, 'max', 5);
    functions
      .map(fn => ({ fn, count: fn.commands.filter(command => !command.allowed).length }))
      .filter(({ count }) => count > max)
      .forEach(({ fn, count }) => reportFunction(context, fn, count, max));
  },
);

const maxCommandDistance = createRule(
  'limit weighted distance for commands caused by a function',
  [
    {
      type: 'object',
      properties: {
        max: { type: 'number', minimum: 0 },
        lineWeight: { type: 'number', minimum: 0 },
        scopeWeight: { type: 'number', minimum: 0 },
        functionCallWeight: { type: 'number', minimum: 0 },
        fileWeight: { type: 'number', minimum: 0 },
        folderWeight: { type: 'number', minimum: 0 },
        sameFunctionWeight: { type: 'number', minimum: 0 },
        scoring: scoringSchema,
        crossFileAnalysis: { type: 'boolean' },
        maxCallDepth: { type: 'integer', minimum: 0 },
        maxCommandsPerFunction: { type: 'integer', minimum: 1 },
        ...recognitionSchema,
      },
      additionalProperties: false,
    },
  ],
  (context, options, functions) => {
    const max = numberOption(options, 'max', 10);
    const lineWeight = numberOption(options, 'lineWeight', 1);
    const scopeWeight = numberOption(options, 'scopeWeight', 1);
    const functionCallWeight = numberOption(options, 'functionCallWeight', 1);
    const fileWeight = numberOption(options, 'fileWeight', 1);
    const folderWeight = numberOption(options, 'folderWeight', 1);
    const sameFunctionWeight = numberOption(options, 'sameFunctionWeight', 1);
    functions
      .flatMap(fn => fn.commands)
      .filter(command => !command.allowed)
      .forEach(command => {
        const distance =
          command.distance.line * lineWeight +
          command.distance.scope * scopeWeight +
          command.distance.functionCall * functionCallWeight +
          command.distance.file * fileWeight +
          (command.distance.folder ?? 0) * folderWeight +
          command.distance.sameFunction * sameFunctionWeight;
        if (distance > max)
          reportCommand(context, command, 'distanceLimit', {
            kind: command.kind,
            actual: format(distance),
            max: format(max),
          });
      });
  },
);

const noRemoteMutation = createRule(
  'disallow mutation of resources outside the current lexical scope',
  [
    {
      type: 'object',
      properties: {
        scoring: scoringSchema,
        crossFileAnalysis: { type: 'boolean' },
        maxCallDepth: { type: 'integer', minimum: 0 },
        maxCommandsPerFunction: { type: 'integer', minimum: 1 },
        ...recognitionSchema,
      },
      additionalProperties: false,
    },
  ],
  (context, _options, functions) => {
    functions
      .flatMap(fn => fn.commands)
      .filter(command => !command.allowed)
      .filter(command => command.kind !== 'discarded-call' && command.remote)
      .forEach(command =>
        reportCommand(context, command, 'remoteMutation', {
          kind: command.kind,
          resource: command.resource ?? '<unknown>',
          distance: String(command.distance.scope),
        }),
      );
  },
);

export const rules: Record<string, Rule.RuleModule> = {
  'max-spaghetti-score': maxSpaghettiScore,
  'max-command-distance': maxCommandDistance,
  'max-commands': maxCommands,
  'no-remote-mutation': noRemoteMutation,
};

export const configs = {
  recommended: {
    parser: '@typescript-eslint/parser',
    parserOptions: { project: true },
    plugins: ['@state-adapt/spaghetti'],
    rules: {
      '@state-adapt/spaghetti/max-spaghetti-score': 'warn',
      '@state-adapt/spaghetti/max-command-distance': 'warn',
      '@state-adapt/spaghetti/max-commands': 'warn',
      '@state-adapt/spaghetti/no-remote-mutation': 'warn',
    },
  },
};

function analysisOptions(options: Options): AnalysisOptions {
  const scoring = options['scoring'];
  const apiPatterns = options['apiPatterns'];
  const builtInRecognizers = options['builtInRecognizers'];
  const maxCallDepth = options['maxCallDepth'];
  const maxCommandsPerFunction = options['maxCommandsPerFunction'];
  return {
    ...(scoring && typeof scoring === 'object'
      ? { scoring: scoring as AnalysisOptions['scoring'] }
      : {}),
    ...(Array.isArray(apiPatterns)
      ? { apiPatterns: apiPatterns as AnalysisOptions['apiPatterns'] }
      : {}),
    ...(Array.isArray(builtInRecognizers)
      ? {
          builtInRecognizers: builtInRecognizers as AnalysisOptions['builtInRecognizers'],
        }
      : {}),
    ...(typeof maxCallDepth === 'number' ? { maxCallDepth } : {}),
    ...(typeof maxCommandsPerFunction === 'number' ? { maxCommandsPerFunction } : {}),
    crossFileAnalysis: options['crossFileAnalysis'] !== false,
  };
}

function analysisForLintFile(
  source: Rule.RuleContext['sourceCode'],
  fileName: string,
  options: Options,
): FileAnalysis {
  const analysisOptionsValue = analysisOptions(options);
  const parserServices = source.parserServices as
    | { program?: { getSourceFiles(): unknown[] } }
    | undefined;
  const program = parserServices?.program;
  if (!program)
    throw new Error(
      'eslint-plugin-spaghetti requires type-aware parser services. Configure @typescript-eslint/parser with parserOptions.project.',
    );
  const cacheKey = JSON.stringify(analysisOptionsValue);
  let cache = programAnalysisCache.get(program);
  if (!cache) {
    cache = new Map();
    programAnalysisCache.set(program, cache);
  }
  let files = cache.get(cacheKey);
  if (!files) {
    files = analyzeProgram(program as never, analysisOptionsValue).files;
    cache.set(cacheKey, files);
  }
  const match = files.find(
    file => normalizePath(file.filePath) === normalizePath(fileName),
  );
  if (!match)
    throw new Error(
      `eslint-plugin-spaghetti could not find ${fileName} in the configured TypeScript project.`,
    );
  return match;
}

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

function numberOption(options: Options, name: string, fallback: number): number {
  const value = options[name];
  return typeof value === 'number' ? value : fallback;
}

function eslintLocation(location: Command['location']): {
  start: { line: number; column: number };
  end: { line: number; column: number };
} {
  return {
    start: { line: location.start.line, column: location.start.column - 1 },
    end: { line: location.end.line, column: Math.max(0, location.end.column - 1) },
  };
}

function format(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
