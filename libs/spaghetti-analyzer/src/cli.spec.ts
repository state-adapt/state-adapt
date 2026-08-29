import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { runCli } from './lib/cli';

describe('report CLI', () => {
  it('documents its invocation', () => {
    expect(runCli(['--help']).output).toContain('Usage: spaghetti-analyzer');
  });

  it('accepts declarative API patterns from JSON config', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spaghetti-cli-v3-'));
    try {
      fs.writeFileSync(
        path.join(root, 'source.ts'),
        'const cache = createCache(); function clear() { return cache.flush(); }',
      );
      fs.writeFileSync(
        path.join(root, 'spaghetti.json'),
        JSON.stringify({
          builtInRecognizers: [],
          apiPatterns: [
            {
              name: 'Cache.flush',
              methods: ['flush'],
              receiverNames: ['cache'],
            },
          ],
        }),
      );

      const output = JSON.parse(
        runCli(['.', '--json', '--config', 'spaghetti.json'], root).output,
      );
      expect(output.project.files[0].commands[0]).toMatchObject({
        kind: 'api-command',
        api: 'Cache.flush',
        recognizer: 'custom:Cache.flush',
      });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('accepts report limits, labels and JSON history without persistent writes', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spaghetti-cli-v4-'));
    try {
      fs.writeFileSync(
        path.join(root, 'source.ts'),
        'let value = 0; function update() { value++; }',
      );
      fs.writeFileSync(
        path.join(root, 'history.json'),
        JSON.stringify([{ label: 'baseline', score: 2 }]),
      );

      const output = JSON.parse(
        runCli(
          [
            '.',
            '--json',
            '--top',
            '1',
            '--history',
            'history.json',
            '--label',
            'candidate',
          ],
          root,
        ).output,
      );
      expect(output.visualizations.hotspots).toHaveLength(1);
      expect(
        output.visualizations.scoreTrend.map((point: { label: string }) => point.label),
      ).toEqual(['baseline', 'candidate']);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('reports real cross-folder propagation and truncation from config', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spaghetti-cli-cross-folder-'));
    try {
      fs.mkdirSync(path.join(root, 'effects'));
      fs.writeFileSync(
        path.join(root, 'effects', 'effect.ts'),
        'export function mutate() { globalThis.one = 1; globalThis.two = 2; }',
      );
      fs.writeFileSync(
        path.join(root, 'caller.ts'),
        "import { mutate } from './effects/effect'; export function run() { mutate(); }",
      );
      fs.writeFileSync(
        path.join(root, 'spaghetti.json'),
        JSON.stringify({ maxCommandsPerFunction: 1 }),
      );

      const output = JSON.parse(
        runCli(['.', '--json', '--config', 'spaghetti.json'], root).output,
      );
      const run = output.project.files
        .flatMap((file: { functions: unknown[] }) => file.functions)
        .find((fn: { name: string }) => fn.name === 'run');

      expect(output.project.truncated).toBe(true);
      expect(run).toMatchObject({ truncated: true, commands: { length: 1 } });
      expect(run.commands[0].distance).toMatchObject({ file: 1, folder: 1 });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
