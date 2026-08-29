import * as path from 'node:path';

import { Linter, RuleTester } from 'eslint';

import { configs, rules } from './rules';

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

describe('typed configuration', () => {
  it('uses parser options supported by the declared parser v7 peer range', () => {
    expect(configs.recommended.parserOptions).toEqual({ project: true });
  });

  it('fails clearly when parser services are missing', () => {
    const linter = new Linter();
    linter.defineRule('spaghetti', rules['max-commands']);
    expect(() =>
      linter.verify('function run() {}', {
        parserOptions: { ecmaVersion: 2022 },
        rules: { spaghetti: 'error' },
      }),
    ).toThrow('requires type-aware parser services');
  });
});

ruleTester.run('max-commands', rules['max-commands'], {
  valid: [
    { filename: typedScratch, code: 'function tidy() { let x = 0; x++; }' },
    {
      filename: typedScratch,
      code: 'function allowed() { let x = 0; x++; x--; }',
      options: [{ max: 2 }],
    },
    {
      filename: typedScratch,
      code: 'declare function calculate(): number; const value = calculate()',
    },
    {
      filename: typedScratch,
      code: 'declare const element: Element; function selected() { const values = []; values.push(1); const result = element.remove(); }',
      options: [{ max: 1, builtInRecognizers: ['javascript'] }],
    },
    {
      filename: typedTsx,
      code: `declare namespace JSX { interface IntrinsicElements { button: unknown } }
declare function onEvent(event: unknown): void;
const view = <button onClick={event => onEvent(event)} />;`,
      options: [{ max: 0 }],
    },
    {
      filename: typedTsx,
      code: `declare namespace JSX { interface IntrinsicElements { button: unknown } }
declare function onEvent(event: unknown): void;
const view = <button onClick={event => {
  event.preventDefault();
  onEvent(event);
}} />;`,
      options: [{ max: 1 }],
    },
  ],
  invalid: [
    {
      code: 'function busy() { let x = 0; x++; x--; external(); }',
      filename: typedScratch,
      options: [{ max: 2 }],
      errors: [{ messageId: 'functionLimit' }],
    },
    {
      code: `function downstream() { window.one = 1; window.two = 2; }
function caller() { downstream(); }`,
      filename: typedScratch,
      options: [{ max: 1 }],
      errors: [
        {
          messageId: 'functionLimit',
          data: { name: 'downstream', actual: '2', max: '1' },
        },
        { messageId: 'functionLimit', data: { name: 'caller', actual: '2', max: '1' } },
      ],
    },
    {
      filename: typedTsx,
      code: `declare namespace JSX { interface IntrinsicElements { widget: unknown } }
declare function onEvent(): void;
const view = <widget renderItem={() => { onEvent(); globalThis.value = 1; }} />;`,
      options: [{ max: 1 }],
      errors: [
        {
          messageId: 'functionLimit',
          data: { name: '<anonymous>', actual: '2', max: '1' },
        },
      ],
    },
    {
      filename: typedScratch,
      code: 'function bounded() { globalThis.one = 1; globalThis.two = 2; }',
      options: [{ max: 5, maxCommandsPerFunction: 1 }],
      errors: [{ messageId: 'analysisTruncated' }],
    },
    {
      code: 'const items = []; function mutate() { items.push(1); items.splice(0, 1); }',
      filename: typedScratch,
      options: [{ max: 1 }],
      errors: [
        {
          messageId: 'functionLimit',
          data: { name: 'mutate', actual: '2', max: '1' },
        },
      ],
    },
    {
      code: 'const cache = makeCache(); function flush() { return cache.flush(); }',
      filename: typedScratch,
      options: [
        {
          max: 0,
          apiPatterns: [
            {
              name: 'Cache.flush',
              methods: ['flush'],
              receiverNames: ['cache'],
              resource: 'receiver',
            },
          ],
        },
      ],
      errors: [
        {
          messageId: 'functionLimit',
          data: { name: 'flush', actual: '1', max: '0' },
        },
      ],
    },
    {
      code: 'declare function mutate(): void; const command = () => mutate();',
      filename: typedScratch,
      options: [{ max: 0 }],
      errors: [
        {
          messageId: 'functionLimit',
          data: { name: 'command', actual: '1', max: '0' },
        },
      ],
    },
    {
      filename: typedTsx,
      code: `declare namespace JSX { interface IntrinsicElements { button: unknown } }
declare function onEvent(event: unknown): void;
const view = <button onClick={event => {
  event.preventDefault();
  onEvent(event);
}} />;`,
      options: [{ max: 0 }],
      errors: [
        {
          messageId: 'functionLimit',
          data: { name: '<anonymous>', actual: '1', max: '0' },
        },
      ],
    },
  ],
});

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
            lineDistanceWeight: 0,
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
      options: [{ max: 1, lineWeight: 0, scopeWeight: 2 }],
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
          lineWeight: 0,
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
            lineWeight: 0,
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
