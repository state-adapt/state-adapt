import { createRule } from './create-rule';
import { maxSchema } from './schemas';
import { numberOption, reportFunction } from './reporting';

export const maxSpaghettiScore = createRule(
  'limit the spaghetti score of a function and its downstream commands',
  maxSchema,
  (context, options, functions) => {
    const max = numberOption(options, 'max', 10);
    functions
      .filter(fn => fn.score > max)
      .forEach(fn => reportFunction(context, fn, fn.score, max));
  },
);
