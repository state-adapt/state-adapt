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
