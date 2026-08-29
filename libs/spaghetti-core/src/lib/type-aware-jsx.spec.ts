import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as ts from 'typescript';

import { analyzeFile, analyzeProject } from './spaghetti-analysis';
import { CommandRecognizer } from './recognizers';

describe('spaghetti type-aware-jsx', () => {
  it('retains JSX handler commands but allows its highest-scoring command', () => {
    const result = analyzeFile(
      `declare namespace JSX { interface IntrinsicElements { button: unknown } }
declare function onEvent(event: unknown): void;
const view = <button onClick={event => {
  event.preventDefault();
  onEvent(event);
}} />;`,
      'view.tsx',
      { scoring: { baseScores: { 'discarded-call': 4 } } },
    );
    const handler = result.functions.find(fn => fn.name === '<anonymous>');

    expect(handler?.commands).toHaveLength(2);
    expect(handler?.commands.filter(command => command.allowed)).toHaveLength(1);
    expect(handler?.score).toBe(4);
  });

  it('allows the actual highest-scoring event command but not render props', () => {
    const result = analyzeFile(
      `declare namespace JSX { interface IntrinsicElements { widget: unknown } }
declare function notify(): void;
const eventView = <widget onChange={() => { notify(); globalThis.value = 1; }} />;
const renderView = <widget renderItem={() => { notify(); globalThis.value = 1; }} />;`,
      'view.tsx',
    );
    const [eventHandler, renderProp] = result.functions.filter(
      fn => fn.name === '<anonymous>',
    );

    expect(eventHandler.commands.map(command => [command.kind, command.allowed])).toEqual(
      [
        ['discarded-call', undefined],
        ['property-assignment', 'jsx-event-handler'],
      ],
    );
    expect(renderProp.commands.every(command => !command.allowed)).toBe(true);
  });

  it('applies the event allowance to concise TSX arrows', () => {
    const result = analyzeFile(
      `declare namespace JSX { interface IntrinsicElements { button: unknown } }
declare function notify(): void;
const view = <button onClick={() => notify()} />;`,
      'view.tsx',
    );
    expect(
      result.functions.find(fn => fn.name === '<anonymous>')?.commands[0].allowed,
    ).toBe('jsx-event-handler');
  });

  it('resolves checker-backed method, nested, element and wrapped calls', () => {
    const result = analyzeFile(`
class Service {
  mutate() { globalThis.a = 1; }
  run() { this.mutate(); }
}
const api = {
  nested: { mutate() { globalThis.b = 1; } },
  mutate() { globalThis.c = 1; }
};
function nested() { api.nested.mutate(); }
function element() { api['mutate'](); }
function leaf() { globalThis.d = 1; }
function wrapped() { (leaf)(); }
`);

    for (const name of ['run', 'nested', 'element', 'wrapped'])
      expect(result.functions.find(fn => fn.name === name)?.commands).toHaveLength(1);
  });

  it('scores file and folder crossings independently', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spaghetti-folders-'));
    try {
      fs.mkdirSync(path.join(root, 'feature'));
      fs.writeFileSync(
        path.join(root, 'feature', 'effect.ts'),
        'export function mutate() { globalThis.value = 1; }',
      );
      fs.writeFileSync(
        path.join(root, 'caller.ts'),
        "import { mutate } from './feature/effect'; export function run() { mutate(); }",
      );
      const run = analyzeProject(root, {
        scoring: {
          declarationLineDistanceWeight: 0,
          scopeCrossingWeight: 0,
          fileCrossingWeight: 2,
          folderCrossingWeight: 7,
        },
      })
        .files.flatMap(file => file.functions)
        .find(fn => fn.name === 'run');

      expect(run?.commands[0].distance).toMatchObject({ file: 1, folder: 1 });
      expect(run?.commands[0].scoreBreakdown).toMatchObject({
        fileCrossings: 2,
        folderCrossings: 7,
      });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('accumulates sibling folder crossings across multiple hops', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spaghetti-folder-hops-'));
    try {
      for (const folder of ['a', 'b', 'c']) fs.mkdirSync(path.join(root, folder));
      fs.writeFileSync(
        path.join(root, 'c', 'leaf.ts'),
        'export function leaf() { globalThis.value = 1; }',
      );
      fs.writeFileSync(
        path.join(root, 'b', 'middle.ts'),
        "import { leaf } from '../c/leaf'; export function middle() { leaf(); }",
      );
      fs.writeFileSync(
        path.join(root, 'a', 'root.ts'),
        "import { middle } from '../b/middle'; export function run() { middle(); }",
      );

      const run = analyzeProject(root)
        .files.flatMap(file => file.functions)
        .find(fn => fn.name === 'run');
      expect(run?.commands[0].distance).toMatchObject({ file: 2, folder: 4 });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
