import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { packages, root } from './config';

const version = JSON.parse(fs.readFileSync(packages[0].sourceManifest, 'utf8')).version;

run('status', '--short');
run('diff');
run('add', ...packages.map(pkg => path.relative(root, pkg.sourceManifest)));
run('commit', '-m', `build: release v${version}`);
run('tag', `v${version}`);

function run(...args: string[]) {
  execFileSync('git', args, { cwd: root, stdio: 'inherit' });
}
