import { createRule } from './create-rule';
import { commandPolicy, policyScore } from './policy';
import { format, reportCommand } from './reporting';
import { noSpaghettiSchema } from './schemas';

const commandLabels = {
  'discarded-call': 'Discarded call',
  assignment: 'Assignment',
  'property-assignment': 'Property assignment',
  increment: 'Increment',
  decrement: 'Decrement',
  delete: 'Delete',
  'api-command': 'API command',
} as const;

export const noSpaghetti = createRule(
  'report individual commands whose aggregate policy score is too high',
  noSpaghettiSchema,
  (context, options, functions) => {
    const policy = commandPolicy(options);
    functions.forEach(fn => {
      let eventAllowance = fn.jsxEventHandler;
      fn.commands.forEach(command => {
        const assessment = policyScore(command, policy);
        if (!assessment.exceedsLimit) return;
        if (eventAllowance) {
          eventAllowance = false;
          return;
        }
        reportCommand(context, command, {
          kind: commandLabels[command.kind],
          score: format(assessment.score),
          maxScore: format(policy.maxScore),
          reason: command.external ? ': external target.' : '.',
        });
      });
    });
  },
);
