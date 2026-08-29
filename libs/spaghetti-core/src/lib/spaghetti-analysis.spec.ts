import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { analyzeFile, analyzeProject } from './spaghetti-analysis';

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
});
