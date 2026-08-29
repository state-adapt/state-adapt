import { rules } from './rules';
import * as path from 'node:path';
import { RuleTester } from 'eslint';

const typedProject = path.resolve(__dirname, 'fixtures/typed-project/tsconfig.json');
const typedCaller = path.resolve(__dirname, 'fixtures/typed-project/caller.ts');
const typedScratch = path.resolve(__dirname, 'fixtures/typed-project/lint.ts');
const typedTsx = path.resolve(__dirname, 'fixtures/typed-project/lint-jsx.tsx');
const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: typedProject,
    tsconfigRootDir: path.dirname(typedProject),
  },
} as never);
const typedRuleTester = ruleTester;

ruleTester.run('max-command-distance', rules['max-command-distance'], {
  valid: [
    {
      filename: typedScratch,
      code: 'function local(value: number) { value++; }',
      options: [{ max: 1 }],
    },
    {
      filename: typedScratch,
      code: 'let shared = 0;\nfunction close() { shared++; }',
      options: [{ max: 5 }],
    },
  ],
  invalid: [
    {
      code: 'let shared = 0;\n\n\nfunction far() {\n  shared++;\n}',
      filename: typedScratch,
      options: [{ max: 2 }],
      errors: [{ messageId: 'distanceLimit' }],
    },
    {
      code: 'let shared = 0; function scoped() { shared++; }',
      filename: typedScratch,
      options: [{ max: 1, declarationLineWeight: 0, scopeWeight: 2 }],
      errors: [{ messageId: 'distanceLimit' }],
    },
    {
      code: `function spread(value: number) {
  // one
  // two
  value++;
}`,
      filename: typedScratch,
      options: [
        {
          max: 2,
          declarationLineWeight: 0,
          scopeWeight: 0,
          functionCallWeight: 0,
          fileWeight: 0,
          sameFunctionWeight: 1,
        },
      ],
      errors: [{ messageId: 'distanceLimit' }],
    },
  ],
});
