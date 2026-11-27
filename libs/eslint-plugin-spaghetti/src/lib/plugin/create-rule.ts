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
          '{{kind}} is classified as spaghetti (score {{score}}; maximum {{maxScore}}){{reason}}',
        analysisTruncated:
          '{{name}} has incomplete analysis because a configured graph limit was reached.',
      },
    },
    create(context) {
      return {
        'Program:exit'() {
          const options = (context.options[0] ?? {}) as RuleOptions;
          // ESLint 10 removed these methods; keep them as fallbacks for early ESLint 8.
          const legacyContext = context as Rule.RuleContext & {
            getSourceCode(): Rule.RuleContext['sourceCode'];
            getFilename(): string;
          };
          const source = context.sourceCode ?? legacyContext.getSourceCode();
          const fileName = context.filename ?? legacyContext.getFilename();
          const analysis = analysisForLintFile(
            source,
            fileName === '<input>' ? 'source.ts' : fileName,
            options,
          );
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
