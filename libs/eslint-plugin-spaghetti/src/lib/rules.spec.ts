import { RuleTester } from 'eslint';

import { rules } from './rules';

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
} as never);

ruleTester.run('max-commands', rules['max-commands'], {
  valid: [
    'function tidy() { let x = 0; x++; }',
    { code: 'function allowed() { let x = 0; x++; x--; }', options: [{ max: 2 }] },
    'const value = calculate()',
  ],
  invalid: [
    {
      code: 'function busy() { let x = 0; x++; x--; external(); }',
      options: [{ max: 2 }],
      errors: [{ messageId: 'functionLimit' }],
    },
    {
      code: `function downstream() { window.one = 1; window.two = 2; }
function caller() { downstream(); }`,
      options: [{ max: 1 }],
      errors: [
        {
          messageId: 'functionLimit',
          data: { name: 'downstream', actual: '2', max: '1' },
        },
        { messageId: 'functionLimit', data: { name: 'caller', actual: '2', max: '1' } },
      ],
    },
  ],
});

ruleTester.run('max-spaghetti-score', rules['max-spaghetti-score'], {
  valid: [
    { code: 'function okay() { let x = 0; x++; }', options: [{ max: 2 }] },
    {
      code: 'function configured() { call(); }',
      options: [{ max: 20, scoring: { baseScores: { 'discarded-call': 20 } } }],
    },
  ],
  invalid: [
    {
      code: 'function expensive() { unknown.value = 1; delete unknown.value; }',
      options: [{ max: 5 }],
      errors: [{ messageId: 'functionLimit' }],
    },
    {
      code: 'function weighted() { call(); }',
      options: [{ max: 4, scoring: { baseScores: { 'discarded-call': 5 } } }],
      errors: [{ messageId: 'functionLimit' }],
    },
  ],
});

ruleTester.run('max-command-distance', rules['max-command-distance'], {
  valid: [
    { code: 'function local(value: number) { value++; }', options: [{ max: 1 }] },
    { code: 'let shared = 0;\nfunction close() { shared++; }', options: [{ max: 5 }] },
  ],
  invalid: [
    {
      code: 'let shared = 0;\n\n\nfunction far() {\n  shared++;\n}',
      options: [{ max: 2 }],
      errors: [{ messageId: 'distanceLimit' }],
    },
    {
      code: 'let shared = 0; function scoped() { shared++; }',
      options: [{ max: 1, lineWeight: 0, scopeWeight: 2 }],
      errors: [{ messageId: 'distanceLimit' }],
    },
  ],
});

ruleTester.run('no-remote-mutation', rules['no-remote-mutation'], {
  valid: [
    'function local(value: number) { value = 2; const obj = { x: 0 }; obj.x = value; }',
    'function callsAreNotMutation() { sideEffect(); }',
    'function block() { { let x = 0; x++; } }',
  ],
  invalid: [
    {
      code: 'let shared = 0; function update() { shared++; }',
      errors: [{ messageId: 'remoteMutation' }],
    },
    {
      code: 'function update() { window.state = 1; delete globalThis.cache; }',
      errors: [{ messageId: 'remoteMutation' }, { messageId: 'remoteMutation' }],
    },
  ],
});
