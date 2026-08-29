import { createRule } from './create-rule';
import { analysisSchema } from './schemas';
import { reportCommand } from './reporting';

export const noRemoteMutation = createRule(
  'disallow mutation of resources outside the current lexical scope',
  analysisSchema,
  (context, _options, functions) => {
    functions
      .flatMap(fn => fn.commands)
      .filter(command => !command.allowed)
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
