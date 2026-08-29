import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as ts from 'typescript';

import { analyzeFile, analyzeProject } from './spaghetti-analysis';
import { CommandRecognizer } from './recognizers';

describe('spaghetti project-analysis', () => {
  it('uses TypeScript module resolution for path aliases and re-exports', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spaghetti-aliases-'));
    try {
      fs.mkdirSync(path.join(root, 'effects'));
      fs.writeFileSync(
        path.join(root, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: {
            baseUrl: '.',
            paths: { '@effects/*': ['effects/*'] },
            module: 'commonjs',
          },
          include: ['**/*.ts'],
        }),
      );
      fs.writeFileSync(
        path.join(root, 'effects', 'leaf.ts'),
        'export function mutate() { globalThis.value = 1; }',
      );
      fs.writeFileSync(
        path.join(root, 'effects', 'index.ts'),
        "export { mutate as change } from './leaf';",
      );
      fs.writeFileSync(
        path.join(root, 'caller.ts'),
        "import { change } from '@effects/index'; export function run() { change(); }",
      );

      const run = analyzeProject(root)
        .files.flatMap(file => file.functions)
        .find(fn => fn.name === 'run');

      expect(run?.commands).toHaveLength(1);
      expect(run?.commands[0]).toMatchObject({
        kind: 'property-assignment',
        distance: { file: 1, folder: 1 },
      });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('bounds call-chain expansion with maxCallDepth', () => {
    const result = analyzeFile(
      `function leaf() { globalThis.value = 1; }
function middle() { leaf(); }
function root() { middle(); }`,
      'bounded.ts',
      { maxCallDepth: 1 },
    );

    expect(result.functions.find(fn => fn.name === 'middle')?.commands).toHaveLength(1);
    expect(result.functions.find(fn => fn.name === 'root')?.commands).toEqual([]);
  });

  it('bounds materialized commands per function', () => {
    const result = analyzeFile(
      `function leaf() { globalThis.one = 1; globalThis.two = 2; globalThis.three = 3; }
function root() { leaf(); }`,
      'bounded-count.ts',
      { maxCommandsPerFunction: 2 },
    );

    expect(result.functions.find(fn => fn.name === 'leaf')).toMatchObject({
      truncated: true,
      commands: { length: 2 },
    });
    expect(result.functions.find(fn => fn.name === 'root')).toMatchObject({
      truncated: true,
      commands: { length: 2 },
    });
    expect(result).toMatchObject({ truncated: true });
  });

  it('truncates wide diamond graphs deterministically', () => {
    const source = `
function leaf() { globalThis.a = 1; globalThis.b = 2; }
function left() { leaf(); }
function right() { leaf(); }
function root() { left(); right(); }
`;
    const first = analyzeFile(source, 'diamond.ts', { maxCommandsPerFunction: 3 });
    const second = analyzeFile(source, 'diamond.ts', { maxCommandsPerFunction: 3 });
    const root = first.functions.find(fn => fn.name === 'root');

    expect(root).toMatchObject({ truncated: true, commands: { length: 3 } });
    expect(root?.commands.map(command => command.callPath[0].callee)).toEqual([
      'diamond.ts:left@3',
      'diamond.ts:left@3',
      'diamond.ts:right@4',
    ]);
    expect(second.functions.find(fn => fn.name === 'root')?.commands).toEqual(
      root?.commands,
    );
  });
});
