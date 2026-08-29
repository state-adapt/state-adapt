import { createRule } from './create-rule';
import { distanceSchema } from './schemas';
import { numberOption, reportCommand, format } from './reporting';

export const maxCommandDistance = createRule(
  'limit weighted distance for commands caused by a function',
  distanceSchema,
  (context, options, functions) => {
    const max = numberOption(options, 'max', 10);
    const weights = {
      declaration: numberOption(options, 'declarationLineWeight', 1),
      scope: numberOption(options, 'scopeWeight', 1),
      call: numberOption(options, 'functionCallWeight', 1),
      file: numberOption(options, 'fileWeight', 1),
      folder: numberOption(options, 'folderWeight', 1),
      local: numberOption(options, 'sameFunctionWeight', 1),
    };
    functions
      .flatMap(fn => fn.commands)
      .filter(command => !command.allowed)
      .forEach(command => {
        const distance =
          command.distance.declarationLine * weights.declaration +
          command.distance.scope * weights.scope +
          command.distance.functionCall * weights.call +
          command.distance.file * weights.file +
          command.distance.folder * weights.folder +
          command.distance.sameFunction * weights.local;
        if (distance > max)
          reportCommand(context, command, 'distanceLimit', {
            kind: command.kind,
            actual: format(distance),
            max: format(max),
          });
      });
  },
);
