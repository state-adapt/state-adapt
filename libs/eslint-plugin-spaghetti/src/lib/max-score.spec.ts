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

ruleTester.run('max-spaghetti-score', rules['max-spaghetti-score'], {
  valid: [
    {
      filename: typedScratch,
      code: 'function okay() { let x = 0; x++; }',
      options: [{ max: 2 }],
    },
    {
      code: 'function configured() { call(); }',
      filename: typedScratch,
      options: [{ max: 20, scoring: { baseScores: { 'discarded-call': 20 } } }],
    },
  ],
  invalid: [
    {
      code: 'function expensive() { unknown.value = 1; delete unknown.value; }',
      filename: typedScratch,
      options: [{ max: 5 }],
      errors: [{ messageId: 'functionLimit' }],
    },
    {
      code: 'function weighted() { call(); }',
      filename: typedScratch,
      options: [{ max: 4, scoring: { baseScores: { 'discarded-call': 5 } } }],
      errors: [{ messageId: 'functionLimit' }],
    },
    {
      code: 'function update() { const values = []; return values.push(1); }',
      filename: typedScratch,
      options: [
        {
          max: 8,
          scoring: { baseScores: { 'api-command': 9 } },
          builtInRecognizers: ['javascript'],
        },
      ],
      errors: [{ messageId: 'functionLimit' }],
    },
    {
      code: 'const values = []; function update() { return values.push(1); }',
      filename: typedScratch,
      options: [
        {
          max: 11,
          scoring: {
            apiBaseScores: { 'Array.push': 12 },
            declarationLineDistanceWeight: 0,
            scopeCrossingWeight: 0,
          },
        },
      ],
      errors: [{ messageId: 'functionLimit' }],
    },
    {
      code: `function leaf() { window.value = 1; }
function middle() { leaf(); }
function root() {
  middle();
}`,
      filename: typedScratch,
      options: [
        {
          max: 15,
          scoring: {
            functionCallDistanceWeight: 10,
            declarationLineDistanceWeight: 0,
            scopeCrossingWeight: 0,
          },
        },
      ],
      errors: [
        {
          messageId: 'functionLimit',
          data: { name: 'root', actual: '23', max: '15' },
        },
      ],
    },
    {
      code: `function spaced(value: number) {
  // separation
  value++;
}`,
      filename: typedScratch,
      options: [
        {
          max: 7,
          scoring: {
            sameFunctionDistanceWeight: 3,
            declarationLineDistanceWeight: 0,
          },
        },
      ],
      errors: [
        {
          messageId: 'functionLimit',
          data: { name: 'spaced', actual: '8', max: '7' },
        },
      ],
    },
  ],
});
