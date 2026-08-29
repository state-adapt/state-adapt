import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { runCli } from './cli';

describe('report CLI', () => {
  it('documents its invocation', () => {
    expect(runCli(['--help']).output).toContain('Usage: state-adapt-spaghetti-report');
  });

  it('accepts declarative API patterns from JSON config', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'spaghetti-cli-v3-'));
    try {
      fs.writeFileSync(
        path.join(root, 'source.ts'),
        'const cache = createCache(); function clear() { cache.flush(); }',
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
});
