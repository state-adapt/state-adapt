import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as ts from 'typescript';

import { analyzeFile, analyzeProject } from './spaghetti-analysis';
import { CommandRecognizer } from './recognizers';

describe('spaghetti analysis', () => {
  it('detects every V1 command kind without traversing into nested functions', () => {
    const result = analyzeFile(`
let distant = 0;
const obj = { x: 0 };
function work(local: number) {
  api();
  local = 1;
  local++;
  --local;
  obj.x = local;
  delete obj.x;
  function nested() { distant++; }
}`);
    expect(
      result.functions.find(fn => fn.name === 'work')?.commands.map(c => c.kind),
    ).toEqual([
      'discarded-call',
      'assignment',
      'increment',
      'decrement',
      'property-assignment',
      'delete',
    ]);
    expect(result.functions.find(fn => fn.name === 'nested')?.commands).toHaveLength(1);
  });

  it('tracks declaration, line and scope distance and configurable scores', () => {
    const [command] = analyzeFile(
      `let shared = 0;\nfunction update() {\n  shared++;\n}`,
      'sample.ts',
      {
        scoring: {
          baseScores: { increment: 10 },
          lineDistanceWeight: 2,
          scopeDistanceWeight: 5,
        },
      },
    ).commands;
    expect(command.declaration?.name).toBe('shared');
    expect(command.distance).toMatchObject({ line: 2, scope: 1 });
    expect(command.remote).toBe(true);
    expect(command.score).toBe(19);
  });

  it('treats parameters and block locals as nearby resources', () => {
    const commands = analyzeFile(`function local(value: number) {
      value = 2;
      { let inside = 0; inside++; }
    }`).commands;
    expect(commands.every(command => !command.remote)).toBe(true);
  });

  it('replaces a resolved call with every downstream command and preserves direct commands', () => {
    const result = analyzeFile(`function write() {
  window.foo = 1;
  window.bar = 2;
}
async function run() {
  await write();
}`);
    const write = result.functions.find(fn => fn.name === 'write');
    const run = result.functions.find(fn => fn.name === 'run');

    expect(write?.commands).toHaveLength(2);
    expect(run?.commands).toHaveLength(2);
    expect(run?.commands.map(command => command.originFunction)).toEqual([
      write?.functionId,
      write?.functionId,
    ]);
    expect(run?.commands.every(command => command.location.start.line < 4)).toBe(true);
    expect(run?.commands.every(command => command.callPath.length === 1)).toBe(true);
    expect(run?.commands[0].callPath[0]).toMatchObject({
      caller: run?.functionId,
      callee: write?.functionId,
      distance: { line: 5, functionCall: 1, file: 0 },
    });
  });

  it('accumulates ordered hops and configurable distance scoring through multiple functions', () => {
    const result = analyzeFile(
      `function leaf() { globalThis.value = 1; }
function middle() { leaf(); }
function root() { middle(); }`,
      'chain.ts',
      {
        scoring: {
          lineDistanceWeight: 0,
          scopeDistanceWeight: 0,
          functionCallDistanceWeight: 3,
        },
      },
    );
    const root = result.functions.find(fn => fn.name === 'root');
    const command = root?.commands[0];

    expect(root?.commands).toHaveLength(1);
    expect(command?.callPath.map(hop => [hop.caller, hop.callee])).toEqual([
      ['chain.ts:root@3', 'chain.ts:middle@2'],
      ['chain.ts:middle@2', 'chain.ts:leaf@1'],
    ]);
    expect(command?.distance).toMatchObject({ functionCall: 2, file: 0, line: 2 });
    expect(command?.score).toBe(9);
  });

  it('resolves aliased, namespace and default relative imports across project files', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spaghetti-v2-'));
    try {
      fs.writeFileSync(
        path.join(root, 'effects.ts'),
        `export function mutate() { globalThis.one = 1; }
export default function remove() { delete globalThis.two; }`,
      );
      fs.writeFileSync(
        path.join(root, 'caller.ts'),
        `import remove, { mutate as change } from './effects';
import * as effects from './effects';
export function run() { change(); remove(); effects.mutate(); }`,
      );
      const project = analyzeProject(root, {
        scoring: { scopeDistanceWeight: 0, fileDistanceWeight: 5 },
      });
      const run = project.files
        .flatMap(file => file.functions)
        .find(fn => fn.name === 'run');

      expect(run?.commands.map(command => command.kind)).toEqual([
        'property-assignment',
        'delete',
        'property-assignment',
      ]);
      expect(run?.commands.every(command => command.distance.file === 1)).toBe(true);
      expect(
        run?.commands.every(command => command.callPath[0].distance.file === 1),
      ).toBe(true);
      expect(run?.commands[0].score).toBe(8);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('terminates recursive graphs while retaining reachable direct commands once per path', () => {
    const result = analyzeFile(`function left() { window.left = 1; right(); }
function right() { window.right = 1; left(); }`);
    const left = result.functions.find(fn => fn.name === 'left');
    const right = result.functions.find(fn => fn.name === 'right');

    expect(left?.commands.map(command => command.resource)).toEqual(['window', 'window']);
    expect(right?.commands.map(command => command.resource)).toEqual([
      'window',
      'window',
    ]);
    expect(left?.commands.map(command => command.originFunction)).toEqual([
      left?.functionId,
      right?.functionId,
    ]);
    expect(right?.commands.map(command => command.originFunction)).toEqual([
      right?.functionId,
      left?.functionId,
    ]);
  });

  it('recognizes JavaScript, DOM, StateAdapt, Angular, RxJS, React and Redux commands', () => {
    const result = analyzeFile(`
import { store } from '@state-adapt/core';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { useReducer, useState } from 'react';
import { useDispatch } from 'react-redux';
function mutate() {
  const values = [];
  const map = new Map();
  const element = document.body;
  const count = signal(0);
  const subject = new Subject();
  const [value, setValue] = useState(0);
  const [state, reactDispatch] = useReducer(reducer, {});
  const dispatch = useDispatch();
  values.push(value);
  map.set('key', value);
  element.setAttribute('data-value', String(value));
  store.update(value);
  count.set(value);
  subject.next(value);
  setValue(value);
  component.setState({ value });
  reactDispatch({ type: 'change' });
  dispatch({ type: 'change' });
  store.dispatch({ type: 'change' });
}`);
    const commands = result.functions.find(fn => fn.name === 'mutate')?.commands ?? [];

    expect(commands).toHaveLength(11);
    expect(commands.every(command => command.kind === 'api-command')).toBe(true);
    expect(commands.map(command => command.recognizer)).toEqual([
      'javascript',
      'javascript',
      'dom',
      'state-adapt',
      'angular',
      'rxjs',
      'react',
      'react',
      'react',
      'redux',
      'redux',
    ]);
    expect(commands.map(command => command.resource)).toEqual([
      'values',
      'map',
      'element',
      'store',
      'count',
      'subject',
      'setValue',
      'component',
      'reactDispatch',
      'dispatch',
      'store',
    ]);
  });

  it('supports JSON-friendly custom method and imported function patterns', () => {
    const commands = analyzeFile(
      `import { publish } from 'events-api';
const cache = createCache();
const event = {};
function work() { cache.flush(); publish(event); }`,
      'custom.ts',
      {
        builtInRecognizers: [],
        apiPatterns: [
          {
            name: 'Cache.flush',
            methods: ['flush'],
            receiverNames: ['cache'],
            resource: 'receiver',
          },
          {
            name: 'Events.publish',
            functions: ['publish'],
            importSources: ['events-api'],
            resource: 'argument',
            argumentIndex: 0,
          },
        ],
      },
    ).functions.find(fn => fn.name === 'work')?.commands;

    expect(commands?.map(command => [command.api, command.resource])).toEqual([
      ['Cache.flush', 'cache'],
      ['Events.publish', 'event'],
    ]);
    expect(commands?.every(command => command.recognizer?.startsWith('custom:'))).toBe(
      true,
    );
  });

  it('distinguishes pure StateAdapt adapters from imperative stores', () => {
    const commands = analyzeFile(`
import { createAdapter, store } from '@state-adapt/core';
const adapter = createAdapter({});
const adaptedStore = adapt({});
const createdStore = createStore({});
function updateAll(state, changes) {
  adapter.update(state, changes);
  adaptedStore.update(changes);
  createdStore.update(changes);
  store.update(changes);
}`).functions.find(fn => fn.name === 'updateAll')?.commands;

    expect(commands?.map(command => [command.kind, command.resource])).toEqual([
      ['discarded-call', undefined],
      ['api-command', 'adaptedStore'],
      ['api-command', 'createdStore'],
      ['api-command', 'store'],
    ]);
    expect(
      commands?.slice(1).every(command => command.recognizer === 'state-adapt'),
    ).toBe(true);
  });

  it('supports programmatic recognizers with stable AST context', () => {
    const recognizer: CommandRecognizer = {
      name: 'transactions',
      recognize(call) {
        if (
          ts.isPropertyAccessExpression(call.expression) &&
          call.expression.name.text === 'commit'
        )
          return { api: 'Transaction.commit', resource: call.expression.expression };
        return undefined;
      },
    };
    const [command] =
      analyzeFile(
        'const transaction = open(); function save() { transaction.commit(); }',
        'programmatic.ts',
        { recognizers: [recognizer], builtInRecognizers: [] },
      ).functions.find(fn => fn.name === 'save')?.commands ?? [];

    expect(command).toMatchObject({
      kind: 'api-command',
      api: 'Transaction.commit',
      recognizer: 'transactions',
      resource: 'transaction',
      remote: true,
    });
  });

  it('does not use initializers from an unrelated lexical scope', () => {
    const result = analyzeFile(`function hidden() { const map = new Map(); }
function work() { map.set('key', 1); }`);

    expect(result.functions.find(fn => fn.name === 'work')?.commands).toEqual([
      expect.objectContaining({ kind: 'discarded-call' }),
    ]);
  });

  it('propagates recognized commands without retaining a duplicate discarded call', () => {
    const result = analyzeFile(`const items = [];
function append() { items.push(1); }
function run() { append(); }`);
    const append = result.functions.find(fn => fn.name === 'append');
    const run = result.functions.find(fn => fn.name === 'run');

    expect(append?.commands).toHaveLength(1);
    expect(run?.commands).toHaveLength(1);
    expect(run?.commands[0]).toMatchObject({
      kind: 'api-command',
      api: 'Array.push',
      originFunction: append?.functionId,
    });
    expect(run?.commands[0].callPath).toHaveLength(1);
  });

  it('prefers known project-function expansion over a matching API recognizer', () => {
    const result = analyzeFile(`function setValue() { globalThis.value = 1; }
function run() { setValue(); }`);
    const run = result.functions.find(fn => fn.name === 'run');

    expect(run?.commands).toHaveLength(1);
    expect(run?.commands[0].kind).toBe('property-assignment');
    expect(run?.commands[0].callPath).toHaveLength(1);
  });

  it('uses the configurable API-command base score and shared distance weights', () => {
    const [command] =
      analyzeFile('const items = [];\nfunction append() { items.push(1); }', 'score.ts', {
        scoring: {
          baseScores: { 'api-command': 12 },
          lineDistanceWeight: 1,
          scopeDistanceWeight: 4,
        },
      }).functions.find(fn => fn.name === 'append')?.commands ?? [];

    expect(command.distance).toMatchObject({ line: 1, scope: 1 });
    expect(command.score).toBe(17);
  });

  it('explains every configurable direct scoring factor', () => {
    const [command] = analyzeFile(
      `let shared = 0;
function update() {
  // separation
  shared++;
}`,
      'breakdown.ts',
      {
        scoring: {
          baseScores: { increment: 10 },
          declarationLineDistanceWeight: 2,
          scopeCrossingWeight: 3,
          sameFunctionDistanceWeight: 5,
          functionSizeWeight: 7,
          lineDistanceWeight: 0,
        },
      },
    ).commands;

    expect(command.distance).toMatchObject({
      declarationLine: 3,
      sameFunction: 2,
      scope: 1,
    });
    expect(command.scoreBreakdown).toMatchObject({
      base: 10,
      declarationLineDistance: 6,
      scopeCrossings: 3,
      sameFunctionDistance: 10,
      functionSize: 28,
      total: 57,
    });
    expect(command.score).toBe(57);
  });

  it('uses API-specific bases and retains the command-kind fallback', () => {
    const commands = analyzeFile(
      'const values = []; const map = new Map(); function work() { values.push(1); map.set("x", 1); }',
      'apis.ts',
      {
        scoring: {
          apiBaseScores: { 'Array.push': 40 },
          baseScores: { 'api-command': 7 },
          declarationLineDistanceWeight: 0,
          scopeCrossingWeight: 0,
        },
      },
    ).commands;

    expect(commands.map(command => command.scoreBreakdown.base)).toEqual([40, 7]);
  });

  it('adds an immutable score layer for every inherited call', () => {
    const result = analyzeFile(
      `function leaf() { globalThis.value = 1; }
function middle() {
  leaf();
}
function root() {
  // separation
  middle();
}`,
      'layers.ts',
      {
        scoring: {
          baseScores: { 'property-assignment': 100 },
          declarationLineDistanceWeight: 0,
          scopeCrossingWeight: 0,
          functionCallDistanceWeight: 4,
          sameFunctionDistanceWeight: 5,
          lineDistanceWeight: 0,
        },
      },
    );
    const leaf = result.functions.find(fn => fn.name === 'leaf')?.commands[0];
    const middle = result.functions.find(fn => fn.name === 'middle')?.commands[0];
    const root = result.functions.find(fn => fn.name === 'root')?.commands[0];

    expect([leaf?.score, middle?.score, root?.score]).toEqual([100, 109, 123]);
    expect(root?.distance.sameFunction).toBe(3);
    expect(
      root?.scoreBreakdown.contributions.filter(
        item => item.factor === 'function-call-distance',
      ),
    ).toHaveLength(2);
    expect(root?.scoreBreakdown.total).toBe(root?.score);
    expect(leaf?.callPath).toEqual([]);
    expect(leaf?.scoreBreakdown.total).toBe(100);
  });

  it('accepts the V1-V3 scope, line and file weight aliases', () => {
    const [command] = analyzeFile(
      'let value = 0;\nfunction update() { value++; }',
      'legacy.ts',
      {
        scoring: {
          baseScores: { increment: 1 },
          lineDistanceWeight: 2,
          scopeDistanceWeight: 3,
        },
      },
    ).commands;
    expect(command.score).toBe(6);
  });
});
