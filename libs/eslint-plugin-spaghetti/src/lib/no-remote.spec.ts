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

ruleTester.run('no-remote-mutation', rules['no-remote-mutation'], {
  valid: [
    {
      filename: typedScratch,
      code: 'function local(value: number) { value = 2; const obj = { x: 0 }; obj.x = value; }',
    },
    { filename: typedScratch, code: 'function callsAreNotMutation() { sideEffect(); }' },
    { filename: typedScratch, code: 'function block() { { let x = 0; x++; } }' },
    {
      filename: typedScratch,
      code: 'const subject = new Subject(); function emit() { return subject.next(1); }',
    },
  ],
  invalid: [
    {
      code: 'let shared = 0; function update() { shared++; }',
      filename: typedScratch,
      errors: [{ messageId: 'remoteMutation' }],
    },
    {
      code: 'function update() { window.state = 1; delete globalThis.cache; }',
      filename: typedScratch,
      errors: [{ messageId: 'remoteMutation' }, { messageId: 'remoteMutation' }],
    },
    {
      code: 'const store = createStore(reducer); function send() { return store.dispatch({ type: "change" }); }',
      filename: typedScratch,
      errors: [
        {
          messageId: 'remoteMutation',
          data: { kind: 'api-command', resource: 'store', distance: '1' },
        },
      ],
    },
  ],
});

typedRuleTester.run('max-commands cross-file analysis', rules['max-commands'], {
  valid: [
    {
      filename: typedCaller,
      code: `import { mutate } from './effect';
export function run(): void { mutate(); }`,
      options: [{ max: 1, crossFileAnalysis: false }],
    },
  ],
  invalid: [
    {
      filename: typedCaller,
      code: `import { mutate } from './effect';
export const run = () => mutate();`,
      options: [{ max: 0, crossFileAnalysis: false }],
      errors: [
        {
          messageId: 'functionLimit',
          data: { name: 'run', actual: '1', max: '0' },
        },
      ],
    },
    {
      filename: typedCaller,
      code: `import { mutate } from './effect';
export function run(): void { mutate(); }`,
      options: [{ max: 1 }],
      errors: [
        {
          messageId: 'functionLimit',
          data: { name: 'run', actual: '2', max: '1' },
        },
      ],
    },
  ],
});

typedRuleTester.run(
  'max-spaghetti-score cross-file analysis',
  rules['max-spaghetti-score'],
  {
    valid: [],
    invalid: [
      {
        filename: typedCaller,
        code: `import { mutate } from './effect';
export function run(): void { mutate(); }`,
        options: [{ max: 1 }],
        errors: [{ messageId: 'functionLimit' }],
      },
    ],
  },
);

typedRuleTester.run(
  'max-command-distance cross-file analysis',
  rules['max-command-distance'],
  {
    valid: [],
    invalid: [
      {
        filename: typedCaller,
        code: `import { mutate } from './effect';
export function run(): void { mutate(); }`,
        options: [
          {
            max: 0,
            declarationLineWeight: 0,
            scopeWeight: 0,
            functionCallWeight: 0,
            fileWeight: 1,
            folderWeight: 0,
            sameFunctionWeight: 0,
          },
        ],
        errors: [{ messageId: 'distanceLimit' }, { messageId: 'distanceLimit' }],
      },
    ],
  },
);

typedRuleTester.run(
  'no-remote-mutation cross-file analysis',
  rules['no-remote-mutation'],
  {
    valid: [],
    invalid: [
      {
        filename: typedCaller,
        code: `import { mutate } from './effect';
export function run(): void { mutate(); }`,
        errors: [{ messageId: 'remoteMutation' }, { messageId: 'remoteMutation' }],
      },
    ],
  },
);
