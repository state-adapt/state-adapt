import * as path from 'node:path';
import { RuleTester } from 'eslint';
import { rules } from './rules';

const fixtureDir = path.resolve(__dirname, 'fixtures/typed-project');
const typedProject = path.join(fixtureDir, 'tsconfig.json');
const typedScratch = path.join(fixtureDir, 'lint.ts');
const typedTsx = path.join(fixtureDir, 'lint-jsx.tsx');
const typedCaller = path.join(fixtureDir, 'caller.ts');
const nestedCaller = path.join(fixtureDir, 'root-caller.ts');
const resourceCaller = path.join(fixtureDir, 'resource-caller.ts');
const nestedResourceCaller = path.join(fixtureDir, 'other/resource-caller.ts');
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
  declarationLineDistanceWeight: 0,
  scopeWeight: 0,
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
      code: `function atDefaultLimit(value: number) {





  value++;
}`,
    },
    {
      filename: typedScratch,
      code: 'declare function external(): void; function run() { external(); }',
      options: [{ ...zeroWeights, externalPenalty: 2, maxScore: 2 }],
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
            actual: '200',
            maxScore: '6',
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
            actual: '200',
            maxScore: '6',
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
      options: [{ maxScore: 0 }],
      errors: [{ messageId: 'spaghetti', line: 3, column: 3 }],
    },
    {
      filename: typedScratch,
      code: `function beyondDefaultLimit(value: number) {






  value++;
}`,
      errors: [
        {
          messageId: 'spaghetti',
          line: 8,
          data: {
            kind: 'increment',
            actual: '7',
            maxScore: '6',
            reason: '',
          },
        },
      ],
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
          declarationLineDistanceWeight: 2,
          maxScore: 3,
        },
      ],
      errors: [{ messageId: 'spaghetti', line: 3, column: 3 }],
    },
    {
      filename: typedScratch,
      code: `class Counter {
  state = { value: 0 };
  update() {
    this.state.value++;
  }
}`,
      options: [{ maxScore: 1 }],
      errors: [
        {
          messageId: 'spaghetti',
          line: 4,
          data: { kind: 'increment', actual: '2', maxScore: '1', reason: '' },
        },
      ],
    },
    {
      filename: typedScratch,
      code: `declare function getState(): { value: number };
function update() {
  getState().value++;
}`,
      errors: [
        {
          messageId: 'spaghetti',
          line: 3,
          data: {
            kind: 'increment',
            actual: '200',
            maxScore: '6',
            reason: ' External target.',
          },
        },
      ],
    },
    {
      filename: typedScratch,
      code: `let shared = 0;
function outer() {
  function inner() {
    shared++;
  }
}`,
      options: [
        {
          ...zeroWeights,
          scopeWeight: 2,
          maxScore: 3,
        },
      ],
      errors: [{ messageId: 'spaghetti', line: 4, column: 5 }],
    },
    {
      filename: typedScratch,
      code: `function leaf(value: { current: number }) { value.current = 1; }

function caller(value: { current: number }) { leaf(value); }`,
      options: [{ ...zeroWeights, declarationLineDistanceWeight: 2, maxScore: 3 }],
      errors: [{ messageId: 'spaghetti', line: 3 }],
    },
    {
      filename: typedScratch,
      code: `function leaf(value: { current: number }) { value.current = 1; return value.current; }
function caller(value: { current: number }) { return leaf(value); }`,
      options: [{ ...zeroWeights, declarationLineDistanceWeight: 1, maxScore: 0 }],
      errors: [
        {
          messageId: 'spaghetti',
          line: 2,
          data: { kind: 'property-assignment', maxScore: '0', reason: '' },
        },
      ],
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
            actual: '200',
            maxScore: '6',
            reason: ' External target.',
          },
        },
      ],
    },
    {
      filename: typedScratch,
      code: 'declare function external(): void; function run() { external(); }',
      options: [{ ...zeroWeights, externalPenalty: 2, maxScore: 1 }],
      errors: [
        {
          messageId: 'spaghetti',
          data: {
            kind: 'discarded-call',
            actual: '2',
            maxScore: '1',
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
          maxScore: 0,
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
          data: {
            kind: 'api-command',
            actual: '1',
            maxScore: '0',
            reason: '',
          },
        },
      ],
    },
    {
      filename: typedTsx,
      code: `declare namespace JSX { interface IntrinsicElements { button: unknown } }
declare function first(): void;
const view = <button onClick={event => {
  event.preventDefault();
  first();
}} />;`,
      options: [{ maxScore: 0 }],
      errors: [
        {
          messageId: 'spaghetti',
          line: 5,
          data: {
            kind: 'discarded-call',
            actual: '3',
            maxScore: '0',
            reason: ' External target.',
          },
        },
      ],
    },
    {
      filename: typedTsx,
      code: `declare namespace JSX { interface IntrinsicElements { button: unknown } }
declare function first(): void;
declare function second(): void;
const view = <button onClick={event => {
  first();
  event.preventDefault();
  second();
}} />;`,
      options: [{ maxScore: 0, allowedCalls: ['first'] }],
      errors: [
        {
          messageId: 'spaghetti',
          line: 7,
          data: {
            kind: 'discarded-call',
            actual: '4',
            maxScore: '0',
            reason: ' External target.',
          },
        },
      ],
    },
  ],
});

ruleTester.run('no-spaghetti project distance', rules['no-spaghetti'], {
  valid: [
    {
      filename: typedCaller,
      code: `import { mutate } from './effect';
export function run(): void { mutate(); }`,
      options: [{ ...zeroWeights, maxScore: 0 }],
    },
  ],
  invalid: [
    {
      filename: resourceCaller,
      code: `import { state } from './state';

export function mutateResource(): void {
  state.value++;
}`,
      errors: [
        {
          messageId: 'spaghetti',
          line: 4,
          data: { kind: 'increment', actual: '31', maxScore: '6', reason: '' },
        },
      ],
    },
    {
      filename: nestedResourceCaller,
      code: `import { nestedState } from '../feature/state';

export function mutateNestedResource(): void {
  nestedState.value++;
}`,
      errors: [
        {
          messageId: 'spaghetti',
          line: 4,
          data: { kind: 'increment', actual: '31', maxScore: '6', reason: '' },
        },
      ],
    },
    {
      filename: typedCaller,
      code: `import { mutate } from './effect';
export function run(): void {
  mutate();
}`,
      options: [
        {
          declarationLineDistanceWeight: 0,
          scopeWeight: 0,
          folderWeight: 0,
          maxScore: 29,
        },
      ],
      errors: [
        {
          messageId: 'spaghetti',
          line: 3,
          column: 3,
          data: { kind: 'discarded-call', maxScore: '29', reason: '' },
        },
      ],
    },
    {
      filename: typedCaller,
      code: `import { mutate } from './effect';
export function run(): void {
  mutate();
}`,
      options: [
        {
          declarationLineDistanceWeight: 0,
          scopeWeight: 0,
          folderWeight: 0,
          maxScore: 29,
          allowedCalls: ['unrelated'],
        },
      ],
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
      options: [
        {
          declarationLineDistanceWeight: 0,
          scopeWeight: 0,
          fileWeight: 0,
          maxScore: 9,
        },
      ],
      errors: [{ messageId: 'spaghetti', line: 3, column: 3 }],
    },
  ],
});
