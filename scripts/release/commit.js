const path = require('node:path');
const { execFileSync } = require('node:child_process');

const { packages, root } = require('./config');

const version = require(packages[0].sourceManifest).version;

run('status', '--short');
run('diff');
run('add', ...packages.map(pkg => path.relative(root, pkg.sourceManifest)));
run('commit', '-m', `build: release v${version}`);
run('tag', `v${version}`);

function run(...args) {
  execFileSync('git', args, { cwd: root, stdio: 'inherit' });
}
