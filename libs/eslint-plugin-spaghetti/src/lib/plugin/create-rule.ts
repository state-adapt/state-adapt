import { Rule } from 'eslint';
import { analysisForLintFile } from './analysis';
import { RuleCheck, RuleOptions } from './types';

export function createRule(
  description: string,
  schema: Rule.RuleMetaData['schema'],
  check: RuleCheck,
): Rule.RuleModule {
  return {
    meta: {
      type: 'suggestion',
      docs: { description },
      schema,
      messages: {
        spaghetti:
          '{{kind}} command exceeds the configured maximum score of {{maxScore}}.{{reason}}',
        analysisTruncated:
          '{{name}} has incomplete analysis because a configured graph limit was reached.',
      },
    },
    create(context) {
      return {
        'Program:exit'() {
          const options = (context.options[0] ?? {}) as RuleOptions;
          const source = context.getSourceCode();
          const fileName =
            context.getFilename() === '<input>' ? 'source.ts' : context.getFilename();
          const analysis = analysisForLintFile(source, fileName, options);
          analysis.functions
            .filter(fn => fn.truncated)
            .forEach(fn =>
              context.report({
                loc: {
                  start: {
                    line: fn.location.start.line,
                    column: fn.location.start.column - 1,
                  },
                  end: {
                    line: fn.location.start.line,
                    column: fn.location.start.column,
                  },
                },
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
