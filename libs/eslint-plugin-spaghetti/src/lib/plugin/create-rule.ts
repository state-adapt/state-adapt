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
                    line: fn.location.end.line,
                    column: fn.location.end.column - 1,
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
