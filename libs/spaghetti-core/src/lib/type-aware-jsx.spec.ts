import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as ts from 'typescript';

import { analyzeFile, analyzeProject } from './spaghetti-analysis';
import { CommandRecognizer } from './recognizers';

describe('spaghetti type-aware-jsx', () => {
  it('retains every JSX handler command in objective analyzer scores', () => {
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
    expect(handler?.jsxEventHandler).toBe(true);
    expect(handler?.score).toBe(
      handler?.commands.reduce((sum, command) => sum + command.score, 0),
    );
  });

  it('marks event-handler context but not render props', () => {
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

    expect(eventHandler.jsxEventHandler).toBe(true);
    expect(renderProp.jsxEventHandler).toBeUndefined();
    expect(eventHandler.score).toBe(
      eventHandler.commands.reduce((sum, command) => sum + command.score, 0),
    );
  });

  it('marks concise TSX arrows as event handlers', () => {
    const result = analyzeFile(
      `declare namespace JSX { interface IntrinsicElements { button: unknown } }
declare function notify(): void;
const view = <button onClick={() => notify()} />;`,
      'view.tsx',
    );
    expect(result.functions.find(fn => fn.name === '<anonymous>')?.jsxEventHandler).toBe(
      true,
    );
  });

  it('marks referenced JSX event handlers without changing their scores', () => {
    const result = analyzeFile(
      `declare namespace JSX { interface IntrinsicElements { button: unknown } }
declare function notify(): void;
const handler = () => notify();
const view = <button onClick={handler} />;`,
      'view.tsx',
    );
    const handler = result.functions.find(fn => fn.name === 'handler');

    expect(handler?.jsxEventHandler).toBe(true);
    expect(handler?.score).toBe(handler?.commands[0].score);
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
