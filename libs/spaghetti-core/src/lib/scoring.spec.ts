import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as ts from 'typescript';

import { analyzeFile, analyzeProject } from './spaghetti-analysis';
import { CommandRecognizer } from './recognizers';

describe('spaghetti scoring', () => {
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
      'const values = []; const map = new Map(); function work() { return [values.push(1), map.set("x", 1)]; }',
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

  it('detects only definitely-void concise arrow bodies as commands', () => {
    const result = analyzeFile(`
declare function mutate(): void;
declare function calculate(): number;
const command = () => mutate();
const query = () => calculate();
const unknown = () => missing();
`);

    expect(result.functions.find(fn => fn.name === 'command')?.commands).toHaveLength(1);
    expect(result.functions.find(fn => fn.name === 'query')?.commands).toEqual([]);
    expect(result.functions.find(fn => fn.name === 'unknown')?.commands).toEqual([]);
  });

  it('uses resolved overloads and unions without treating async arrows as void', () => {
    const result = analyzeFile(`
declare function overloaded(value: string): void;
declare function overloaded(value: number): number;
declare function maybe(): void | undefined;
declare function mutate(): void;
const overloadedCommand = () => overloaded('value');
const overloadedQuery = () => overloaded(1);
const unionCommand = () => maybe();
const asyncArrow = async () => mutate();
`);

    expect(
      result.functions.find(fn => fn.name === 'overloadedCommand')?.commands,
    ).toHaveLength(1);
    expect(result.functions.find(fn => fn.name === 'overloadedQuery')?.commands).toEqual(
      [],
    );
    expect(
      result.functions.find(fn => fn.name === 'unionCommand')?.commands,
    ).toHaveLength(1);
    expect(result.functions.find(fn => fn.name === 'asyncArrow')?.commands).toEqual([]);
  });

  it('detects imported void calls in concise arrows', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spaghetti-imported-void-'));
    try {
      fs.writeFileSync(
        path.join(root, 'effect.ts'),
        'export function mutate(): void { globalThis.value = 1; }',
      );
      fs.writeFileSync(
        path.join(root, 'caller.ts'),
        "import { mutate } from './effect'; export const command = () => mutate();",
      );

      const command = analyzeProject(root)
        .files.flatMap(file => file.functions)
        .find(fn => fn.name === 'command');
      expect(command?.commands).toHaveLength(1);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
