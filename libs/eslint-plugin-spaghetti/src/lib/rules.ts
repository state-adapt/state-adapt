import { Rule } from 'eslint';
import { noSpaghetti } from './plugin/no-spaghetti-rule';

export const rules: Record<string, Rule.RuleModule> = {
  'no-spaghetti': noSpaghetti,
};

export const configs = {
  recommended: {
    parser: '@typescript-eslint/parser',
    parserOptions: { project: true },
    plugins: ['@state-adapt/spaghetti'],
    rules: {
      '@state-adapt/spaghetti/no-spaghetti': 'error',
    },
  },
};
