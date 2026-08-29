import { Rule } from 'eslint';
import { maxCommandDistance } from './plugin/max-distance-rule';
import { maxCommands } from './plugin/max-commands-rule';
import { maxSpaghettiScore } from './plugin/max-score-rule';
import { noRemoteMutation } from './plugin/no-remote-rule';

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
