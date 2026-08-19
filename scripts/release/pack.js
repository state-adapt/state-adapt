const { execFileSync } = require('node:child_process');

const { npmCache, packages } = require('./config');

for (const pkg of packages) {
  execFileSync('npm', ['pack'], {
    cwd: pkg.distDir,
    env: { ...process.env, npm_config_cache: npmCache },
    stdio: 'inherit',
  });
}
