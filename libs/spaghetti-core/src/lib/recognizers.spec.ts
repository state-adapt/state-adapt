import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as ts from 'typescript';

import { analyzeFile, analyzeProject } from './spaghetti-analysis';
import { CommandRecognizer } from './recognizers';

describe('spaghetti recognizers', () => {
  it('recognizes framework entry points through aliased and namespace imports', () => {
    const commands = analyzeFile(
      `import { bootstrapApplication as bootstrap } from '@angular/platform-browser';
import * as Vue from 'vue';
function start() {
  bootstrap({}).catch(() => {});
  const app = Vue.createApp({});
  app.mount('#app');
}`,
      'framework.ts',
    ).functions.find(fn => fn.name === 'start')?.commands;

    expect(commands?.map(command => [command.kind, command.api])).toEqual([
      ['discarded-call', 'Angular.bootstrapApplication'],
      ['api-command', 'Vue.createApp'],
      ['discarded-call', 'Vue.createApp'],
    ]);
    expect(commands?.every(command => command.recognizer === 'framework')).toBe(true);
  });

  it('can disable framework recognition with the other built-in recognizers', () => {
    const commands = analyzeFile(
      `import { mount } from 'svelte';
function start() { mount({}); }`,
      'framework.ts',
      { builtInRecognizers: ['javascript', 'dom'] },
    ).functions.find(fn => fn.name === 'start')?.commands;

    expect(commands).toMatchObject([{ kind: 'discarded-call', call: 'mount' }]);
    expect(commands?.[0].api).toBeUndefined();
  });

  it('annotates discarded calls and their receiver chains with recognized APIs', () => {
    const commands = analyzeFile(
      `import { start as boot } from 'app-runtime';
const cache = createCache();
function work() {
  cache.flush();
  boot().catch(() => {});
}`,
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
            name: 'App.start',
            functions: ['start'],
            importSources: ['app-runtime'],
            resource: 'callee',
          },
        ],
      },
    ).functions.find(fn => fn.name === 'work')?.commands;

    expect(commands).toMatchObject([
      {
        kind: 'discarded-call',
        call: 'cache.flush',
        api: 'Cache.flush',
        recognizer: 'custom:Cache.flush',
      },
      {
        kind: 'discarded-call',
        call: 'boot().catch',
        api: 'App.start',
        recognizer: 'custom:App.start',
      },
    ]);
  });

  it('annotates definitely-void calls in concise arrow functions', () => {
    const command = analyzeFile(
      `declare const logger: { log(): void };
const run = () => logger.log();`,
      'custom.ts',
      {
        builtInRecognizers: [],
        apiPatterns: [
          {
            name: 'Logger.log',
            methods: ['log'],
            receiverNames: ['logger'],
            resource: 'receiver',
          },
        ],
      },
    ).functions.find(fn => fn.name === 'run')?.commands[0];

    expect(command).toMatchObject({
      kind: 'discarded-call',
      call: 'logger.log',
      api: 'Logger.log',
    });
  });

  it('supports JSON-friendly custom method and imported function patterns', () => {
    const commands = analyzeFile(
      `import { publish } from 'events-api';
const cache = createCache();
const event = {};
function work() { return [cache.flush(), publish(event)]; }`,
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

  it('recognizes exact source call patterns and can discard APIs before propagation', () => {
    const analysis = analyzeFile(
      `declare const console: { log(value: string): void };
function leaf() { console.log('ready'); }
function wrapper() { leaf(); }`,
      'custom.ts',
      {
        builtInRecognizers: [],
        apiPatterns: [{ name: 'Console.log', calls: ['console.log'] }],
        ignoredApis: ['Console.log'],
      },
    );

    expect(
      analysis.functions
        .filter(fn => fn.name === 'leaf' || fn.name === 'wrapper')
        .flatMap(fn => fn.commands),
    ).toEqual([]);
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
        'const transaction = open(); function save() { return transaction.commit(); }',
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

  it('propagates generally detected calls without retaining duplicates', () => {
    const result = analyzeFile(`const items = [];
function append() { items.push(1); }
function run() { append(); }`);
    const append = result.functions.find(fn => fn.name === 'append');
    const run = result.functions.find(fn => fn.name === 'run');

    expect(append?.commands).toHaveLength(1);
    expect(run?.commands).toHaveLength(1);
    expect(run?.commands[0]).toMatchObject({
      kind: 'discarded-call',
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
      analyzeFile(
        'const items = [];\nfunction append() { return items.push(1); }',
        'score.ts',
        {
          scoring: {
            baseScores: { 'api-command': 12 },
            declarationLineDistanceWeight: 1,
            scopeCrossingWeight: 4,
          },
        },
      ).functions.find(fn => fn.name === 'append')?.commands ?? [];

    expect(command.distance).toMatchObject({ declarationLine: 1, scope: 1 });
    expect(command.score).toBe(17);
  });
});
