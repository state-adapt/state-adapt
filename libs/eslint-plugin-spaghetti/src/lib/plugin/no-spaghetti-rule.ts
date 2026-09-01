import { Command } from '@state-adapt/spaghetti-core';
import { createRule } from './create-rule';
import { commandPolicy, isAllowlisted, policyScore } from './policy';
import { format, reportCommand } from './reporting';
import { noSpaghettiSchema } from './schemas';

export const noSpaghetti = createRule(
  'report individual commands whose aggregate policy score is too high',
  noSpaghettiSchema,
  (context, options, functions) => {
    const policy = commandPolicy(options);
    functions.forEach(fn => {
      const assessed = fn.commands
        .filter(command => !isAllowlisted(command, policy))
        .map(command => ({ command, score: policyScore(command, policy) }));
      const eventAllowance = fn.jsxEventHandler ? highestCommand(assessed) : undefined;
      assessed
        .filter(entry => entry !== eventAllowance && entry.score > policy.maxScore)
        .forEach(({ command, score }) =>
          reportCommand(context, command, {
            kind: command.kind,
            actual: format(score),
            maxScore: format(policy.maxScore),
            reason: command.external ? ' External target.' : '',
          }),
        );
    });
  },
);

function highestCommand<T extends { command: Command; score: number }>(
  commands: T[],
): T | undefined {
  return commands.reduce<T | undefined>(
    (highest, current) => (!highest || current.score > highest.score ? current : highest),
    undefined,
  );
}
