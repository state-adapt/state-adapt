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
      let eventAllowance = fn.jsxEventHandler;
      fn.commands.forEach(command => {
        if (isAllowlisted(command, policy)) return;
        const assessment = policyScore(command, policy);
        if (!assessment.exceedsLimit) return;
        if (eventAllowance) {
          eventAllowance = false;
          return;
        }
        reportCommand(context, command, {
          kind: command.kind,
          maxScore: format(policy.maxScore),
          reason: command.external ? ' External target.' : '',
        });
      });
    });
  },
);
