import { createRule } from './create-rule';
import { maxSchema } from './schemas';
import { numberOption, reportFunction } from './reporting';

export const maxCommands = createRule(
  'limit the number of commands caused by a function',
  maxSchema,
  (context, options, functions) => {
    const max = numberOption(options, 'max', 5);
    functions
      .map(fn => ({
        fn,
        count: fn.commands.filter(command => !command.allowed).length,
      }))
      .filter(({ count }) => count > max)
      .forEach(({ fn, count }) => reportFunction(context, fn, count, max));
  },
);
