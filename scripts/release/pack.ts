import { execFileSync } from 'node:child_process';

import { npmCache, packages } from './config';

for (const pkg of packages) {
  execFileSync('npm', ['pack'], {
    cwd: pkg.distDir,
    env: { ...process.env, npm_config_cache: npmCache },
    stdio: 'inherit',
  });
}
