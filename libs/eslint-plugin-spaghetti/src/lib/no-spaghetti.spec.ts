import * as path from 'node:path';
import { RuleTester } from 'eslint';
import { rules } from './rules';

const fixtureDir = path.resolve(__dirname, 'fixtures/typed-project');
const typedProject = path.join(fixtureDir, 'tsconfig.json');
const typedScratch = path.join(fixtureDir, 'lint.ts');
const typedTsx = path.join(fixtureDir, 'lint-jsx.tsx');
const typedCaller = path.join(fixtureDir, 'caller.ts');
const nestedCaller = path.join(fixtureDir, 'root-caller.ts');
const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: typedProject,
    tsconfigRootDir: fixtureDir,
  },
} as never);

const zeroWeights = {
  declarationLineWeight: 0,
  sameFunctionWeight: 0,
  scopeWeight: 0,
  functionCallWeight: 0,
  fileWeight: 0,
  folderWeight: 0,
};

ruleTester.run('no-spaghetti command policy', rules['no-spaghetti'], {
  valid: [
    {
      filename: typedScratch,
      code: 'function local(value: number) { value++; }',
    },
    {
      filename: typedScratch,
      code: 'declare function external(): void; function run() { external(); }',
      options: [{ ...zeroWeights, externalPenalty: 'ignore' }],
    },
    {
      filename: typedScratch,
      code: 'declare function external(): void; function run() { external(); }',
      options: [{ ...zeroWeights, externalPenalty: 2, max: 2 }],
    },
    {
      filename: typedScratch,
      code: 'declare function external(): void; function run() { external(); }',
      options: [{ allowedCalls: ['external'] }],
    },
    {
      filename: typedScratch,
      code: 'const cache = makeCache(); function flush() { return cache.flush(); }',
      options: [
        {
          allowedApis: ['Cache.flush'],
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
    },
    {
      filename: typedTsx,
      code: `declare namespace JSX { interface IntrinsicElements { button: unknown } }
declare function onEvent(event: unknown): void;
const view = <button onClick={event => {
  event.preventDefault();
  onEvent(event);
}} />;`,
    },
    {
      filename: typedTsx,
      code: `declare namespace JSX { interface IntrinsicElements { button: unknown } }
declare function onEvent(event: unknown): void;
const handler = (event: { preventDefault(): void }) => {
  event.preventDefault();
  onEvent(event);
};
const view = <button onClick={handler} />;`,
    },
    {
      filename: typedTsx,
      code: `declare namespace JSX { interface IntrinsicElements { button: unknown } }
declare function onEvent(): void;
const view = <button onClick={() => onEvent()} />;`,
    },
  ],
  invalid: [
    {
      filename: typedScratch,
      code: `function component(onEvent: () => void) {
  return () => { onEvent(); };
}`,
      options: [{ ...zeroWeights }],
      errors: [
        {
          messageId: 'spaghetti',
          line: 2,
          data: {
            kind: 'discarded-call',
            actual: 'maximum',
            max: '0',
            reason: ' External target.',
          },
        },
      ],
    },
    {
      filename: typedScratch,
      code: 'function update() { globalThis.value = 1; }',
      options: [{ ...zeroWeights }],
      errors: [
        {
          messageId: 'spaghetti',
          data: {
            kind: 'property-assignment',
            actual: 'maximum',
            max: '0',
            reason: ' External target.',
          },
        },
      ],
    },
    {
      filename: typedScratch,
      code: `declare module 'external-package' { const api: { write(): void }; export default api; }
import api from 'external-package';
function update() { api.write(); }`,
      options: [{ ...zeroWeights }],
      errors: [{ messageId: 'spaghetti', line: 3 }],
    },
    {
      filename: typedScratch,
      code: `let shared = 0;
function update() {
  shared++;
}`,
      errors: [{ messageId: 'spaghetti', line: 3, column: 3 }],
    },
    {
      filename: typedScratch,
      code: `function spaced(value: number) {
  // distance
  value++;
}`,
      options: [
        {
          ...zeroWeights,
          declarationLineWeight: 2,
          sameFunctionWeight: 3,
          max: 9,
        },
      ],
      errors: [{ messageId: 'spaghetti', line: 3, column: 3 }],
    },
    {
      filename: typedScratch,
      code: `function leaf(value: { current: number }) { value.current = 1; }
function caller(value: { current: number }) { leaf(value); }`,
      options: [{ ...zeroWeights, functionCallWeight: 4, max: 3 }],
      errors: [{ messageId: 'spaghetti', line: 2 }],
    },
    {
      filename: typedScratch,
      code: 'declare function external(): void; function run() { external(); }',
      options: [{ ...zeroWeights }],
      errors: [
        {
          messageId: 'spaghetti',
          data: {
            kind: 'discarded-call',
            actual: 'maximum',
            max: '0',
            reason: ' External target.',
          },
        },
      ],
    },
    {
      filename: typedScratch,
      code: 'declare function external(): void; function run() { external(); }',
      options: [{ ...zeroWeights, externalPenalty: 2, max: 1 }],
      errors: [
        {
          messageId: 'spaghetti',
          data: {
            kind: 'discarded-call',
            actual: '2',
            max: '1',
            reason: ' External target.',
          },
        },
      ],
    },
    {
      filename: typedScratch,
      code: 'const cache = makeCache(); function flush() { return cache.flush(); }',
      options: [
        {
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
          messageId: 'spaghetti',
          data: { kind: 'api-command', actual: '1', max: '0', reason: '' },
        },
      ],
    },
    {
      filename: typedTsx,
      code: `declare namespace JSX { interface IntrinsicElements { button: unknown } }
declare function first(): void;
declare function second(): void;
const view = <button onClick={() => { first(); second(); }} />;`,
      errors: [{ messageId: 'spaghetti' }],
    },
  ],
});

ruleTester.run('no-spaghetti project distance', rules['no-spaghetti'], {
  valid: [
    {
      filename: typedCaller,
      code: `import { mutate } from './effect';
export function run(): void { mutate(); }`,
      options: [{ ...zeroWeights, max: 0 }],
    },
  ],
  invalid: [
    {
      filename: typedCaller,
      code: `import { mutate } from './effect';
export function run(): void {
  mutate();
}`,
      options: [{ ...zeroWeights, fileWeight: 3, max: 2 }],
      errors: [
        { messageId: 'spaghetti', line: 3, column: 3 },
        { messageId: 'spaghetti', line: 3, column: 3 },
      ],
    },
    {
      filename: nestedCaller,
      code: `import { mutateNested } from './feature/effect';
export function runNested(): void {
  mutateNested();
}`,
      options: [{ ...zeroWeights, folderWeight: 5, max: 4 }],
      errors: [{ messageId: 'spaghetti', line: 3, column: 3 }],
    },
  ],
});
