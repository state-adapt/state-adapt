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
    {
      code: 'function selected() { const values = []; values.push(1); const result = element.remove(); }',
      options: [{ max: 1, builtInRecognizers: ['javascript'] }],
    },
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
    {
      code: 'const items = []; function mutate() { items.push(1); items.splice(0, 1); }',
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
    {
      code: 'function update() { const values = []; return values.push(1); }',
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
    {
      code: `function spread(value: number) {
  // one
  // two
  value++;
}`,
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
    'function local(value: number) { value = 2; const obj = { x: 0 }; obj.x = value; }',
    'function callsAreNotMutation() { sideEffect(); }',
    'function block() { { let x = 0; x++; } }',
    'const subject = new Subject(); function emit() { return subject.next(1); }',
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
    {
      code: 'const store = createStore(reducer); function send() { return store.dispatch({ type: "change" }); }',
      errors: [
        {
          messageId: 'remoteMutation',
          data: { kind: 'api-command', resource: 'store', distance: '1' },
        },
      ],
    },
  ],
});
