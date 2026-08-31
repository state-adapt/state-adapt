import { Command } from '@state-adapt/spaghetti-core';
import { createRule } from './create-rule';
import { commandPolicy, isAllowlisted, policyDistance } from './policy';
import { format, reportCommand } from './reporting';
import { noSpaghettiSchema } from './schemas';

export const noSpaghetti = createRule(
  'report individual commands whose weighted policy distance is too high',
  noSpaghettiSchema,
  (context, options, functions) => {
    const policy = commandPolicy(options);
    functions.forEach(fn => {
      const assessed = fn.commands
        .filter(command => !isAllowlisted(command, policy))
        .map(command => ({ command, distance: policyDistance(command, policy) }));
      const eventAllowance = fn.jsxEventHandler ? highestCommand(assessed) : undefined;
      assessed
        .filter(entry => entry !== eventAllowance && entry.distance > policy.max)
        .forEach(({ command, distance }) =>
          reportCommand(context, command, {
            kind: command.kind,
            actual: format(distance),
            max: format(policy.max),
            reason: command.external ? ' External target.' : '',
          }),
        );
    });
  },
);

function highestCommand<T extends { command: Command; distance: number }>(
  commands: T[],
): T | undefined {
  return commands.reduce<T | undefined>(
    (highest, current) =>
      !highest || current.distance > highest.distance ? current : highest,
    undefined,
  );
}
