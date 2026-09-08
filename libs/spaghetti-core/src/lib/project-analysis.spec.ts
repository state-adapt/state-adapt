import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as ts from 'typescript';

import { analyzeFile, analyzeProject } from './spaghetti-analysis';
import { CommandRecognizer } from './recognizers';

describe('spaghetti project-analysis', () => {
  it('resolves direct imported resources with file and folder distance', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spaghetti-resources-'));
    try {
      fs.mkdirSync(path.join(root, 'src', 'a'), { recursive: true });
      fs.mkdirSync(path.join(root, 'src', 'b'), { recursive: true });
      fs.writeFileSync(
        path.join(root, 'tsconfig.json'),
        JSON.stringify({ compilerOptions: { module: 'commonjs' }, include: ['**/*.ts'] }),
      );
      fs.writeFileSync(
        path.join(root, 'src', 'a', 'state.ts'),
        'export const state = { value: 0 };',
      );
      fs.writeFileSync(
        path.join(root, 'src', 'b', 'mutate.ts'),
        "import { state } from '../a/state'; export function mutate() { state.value++; }",
      );
      fs.writeFileSync(
        path.join(root, 'src', 'a', 'mutate-same.ts'),
        "import { state } from './state'; export function mutateSame() { state.value++; }",
      );

      const result = analyzeProject(root, {
        scoring: {
          scopeCrossingWeight: 1,
          fileCrossingWeight: 30,
          folderCrossingWeight: 10,
        },
      });
      const command = result.files.find(file =>
        file.filePath.endsWith('/src/b/mutate.ts'),
      )?.commands[0];
      const sameFolder = result.files.find(file =>
        file.filePath.endsWith('/src/a/mutate-same.ts'),
      )?.commands[0];

      expect(command).toMatchObject({
        resource: 'state',
        distance: { declarationLine: 0, scope: 1, file: 1, folder: 2 },
        declaration: { name: 'state', kind: 'variable' },
        remote: true,
      });
      expect(command?.external).toBeUndefined();
      expect(command?.declaration?.location.filePath).toMatch(/src\/a\/state\.ts$/);
      expect(command?.scoreBreakdown).toMatchObject({
        scopeCrossings: 1,
        fileCrossings: 30,
        folderCrossings: 20,
      });
      expect(sameFolder).toMatchObject({
        distance: { declarationLine: 0, scope: 1, file: 1, folder: 0 },
      });
      expect(sameFolder?.external).toBeUndefined();
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

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

  it('stops call expansion after a weighted call boundary exceeds a limit', () => {
    const result = analyzeFile(
      `function leaf(value: { current: number }) { value.current = 1; }
function root(value: { current: number }) { leaf(value); }`,
      'direct-calls.ts',
      {
        maxCallBoundaryScore: 0,
        scoring: { declarationLineDistanceWeight: 1 },
      },
    );

    expect(result.functions.find(fn => fn.name === 'root')?.commands).toMatchObject([
      { kind: 'discarded-call', call: 'leaf', callPath: [] },
    ]);

    const concise = analyzeFile(
      `function leaf(): void { globalThis.value = 1; }
const root = () => leaf();`,
      'concise-call.ts',
      {
        maxCallBoundaryScore: 0,
        scoring: { declarationLineDistanceWeight: 1 },
      },
    );
    expect(concise.functions.find(fn => fn.name === 'root')?.commands).toMatchObject([
      { kind: 'discarded-call', call: 'leaf', callPath: [] },
    ]);
  });

  it('expands a value-used call even when its boundary exceeds the limit', () => {
    const result = analyzeFile(
      `function leaf(value: { current: number }) { value.current = 1; return value.current; }
function root(value: { current: number }) { return leaf(value); }`,
      'value-used-call.ts',
      {
        maxCallBoundaryScore: 0,
        scoring: { declarationLineDistanceWeight: 1 },
      },
    );

    expect(result.functions.find(fn => fn.name === 'root')?.commands).toMatchObject([
      { kind: 'property-assignment', callPath: [{ distance: { declarationLine: 1 } }] },
    ]);
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

  it('bounds resource tracing with maxResourceTraceDepth and surfaces truncation', () => {
    const source = `const resource = {};
const alias = resource;
function mutate() { alias.value = 1; }`;

    const truncated = analyzeFile(source, 'bounded-resource.ts', {
      maxResourceTraceDepth: 2,
    });
    expect(truncated.functions.find(fn => fn.name === 'mutate')).toMatchObject({
      truncated: true,
      commands: [
        {
          resourceProvenance: {
            confidence: 'unknown',
            origins: [{ kind: 'unknown' }],
          },
        },
      ],
    });
    expect(truncated).toMatchObject({ truncated: true });

    const complete = analyzeFile(source, 'bounded-resource.ts', {
      maxResourceTraceDepth: 4,
    });
    expect(complete.truncated).toBeUndefined();
    expect(complete.functions.find(fn => fn.name === 'mutate')).toMatchObject({
      commands: [
        {
          resourceProvenance: {
            confidence: 'proven',
            origins: [{ kind: 'allocation' }],
          },
        },
      ],
    });

    const rebound = analyzeFile(
      `const resource = {};
const alias = resource;
function update(value: { current?: number }) { value.current = 1; }
function mutate() { update(alias); }`,
      'bounded-argument.ts',
      { maxResourceTraceDepth: 1 },
    );
    expect(rebound.functions.find(fn => fn.name === 'mutate')).toMatchObject({
      truncated: true,
      commands: [
        {
          resourceProvenance: {
            confidence: 'unknown',
            origins: [{ kind: 'unknown' }],
          },
        },
      ],
    });
  });

  it('defaults maxResourceTraceDepth to 40', () => {
    const sourceAtDepth = (aliasCount: number) => {
      const aliases = Array.from(
        { length: aliasCount },
        (_, index) => `const value${index + 1} = value${index};`,
      ).join('\n');
      return `const value0 = {};
${aliases}
function mutate() { value${aliasCount}.current = 1; }`;
    };

    expect(analyzeFile(sourceAtDepth(37), 'default-depth.ts').truncated).toBeUndefined();
    expect(analyzeFile(sourceAtDepth(38), 'default-depth.ts')).toMatchObject({
      truncated: true,
    });
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
