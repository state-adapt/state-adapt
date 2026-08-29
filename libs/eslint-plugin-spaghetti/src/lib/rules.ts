import { analyzeFile, AnalysisOptions, Command, FunctionAnalysis } from '@state-adapt/spaghetti-analysis';
import { Rule } from 'eslint';

type Options = Record<string, unknown>;
type Check = (
  context: Rule.RuleContext,
  options: Options,
  functions: FunctionAnalysis[],
) => void;

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
        functionLimit: '{{name}} has {{actual}}, above the configured maximum of {{max}}.',
        distanceLimit:
          '{{kind}} command distance is {{actual}}, above the configured maximum of {{max}}.',
        remoteMutation:
          '{{kind}} mutates remote resource {{resource}} (declared {{distance}} scope(s) away).',
      },
    },
    create(context) {
      return {
        'Program:exit'() {
          const options = (context.options[0] ?? {}) as Options;
          const source = context.getSourceCode();
          const analysis = analyzeFile(
            source.text,
            context.getFilename() === '<input>' ? 'source.ts' : context.getFilename(),
            analysisOptions(options),
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
    lineDistanceWeight: { type: 'number', minimum: 0 },
    scopeDistanceWeight: { type: 'number', minimum: 0 },
    functionSizeWeight: { type: 'number', minimum: 0 },
    baseScores: {
      type: 'object',
      additionalProperties: { type: 'number', minimum: 0 },
    },
  },
  additionalProperties: false,
};

const maxSchema = [
  {
    type: 'object',
    properties: { max: { type: 'number', minimum: 0 }, scoring: scoringSchema },
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
  context.report({ loc: eslintLocation(command.location), messageId, data });
}

const maxSpaghettiScore = createRule(
  'limit the direct spaghetti score of a function',
  maxSchema,
  (context, options, functions) => {
    const max = numberOption(options, 'max', 10);
    functions.filter(fn => fn.score > max).forEach(fn => reportFunction(context, fn, fn.score, max));
  },
);

const maxCommands = createRule(
  'limit the number of direct commands in a function',
  maxSchema,
  (context, options, functions) => {
    const max = numberOption(options, 'max', 5);
    functions
      .filter(fn => fn.commands.length > max)
      .forEach(fn => reportFunction(context, fn, fn.commands.length, max));
  },
);

const maxCommandDistance = createRule(
  'limit weighted declaration distance for direct commands',
  [
    {
      type: 'object',
      properties: {
        max: { type: 'number', minimum: 0 },
        lineWeight: { type: 'number', minimum: 0 },
        scopeWeight: { type: 'number', minimum: 0 },
        scoring: scoringSchema,
      },
      additionalProperties: false,
    },
  ],
  (context, options, functions) => {
    const max = numberOption(options, 'max', 10);
    const lineWeight = numberOption(options, 'lineWeight', 1);
    const scopeWeight = numberOption(options, 'scopeWeight', 1);
    functions.flatMap(fn => fn.commands).forEach(command => {
      const distance = command.distance.line * lineWeight + command.distance.scope * scopeWeight;
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
  [{ type: 'object', properties: { scoring: scoringSchema }, additionalProperties: false }],
  (context, _options, functions) => {
    functions
      .flatMap(fn => fn.commands)
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
    plugins: ['state-adapt'],
    rules: {
      'state-adapt/max-spaghetti-score': 'warn',
      'state-adapt/max-command-distance': 'warn',
      'state-adapt/max-commands': 'warn',
      'state-adapt/no-remote-mutation': 'warn',
    },
  },
};

function analysisOptions(options: Options): AnalysisOptions {
  const scoring = options['scoring'];
  return scoring && typeof scoring === 'object'
    ? { scoring: scoring as AnalysisOptions['scoring'] }
    : {};
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
