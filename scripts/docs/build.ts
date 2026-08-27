import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(__dirname, '../..');
const dist = path.join(root, 'apps/docs2/.vitepress/dist');
const vitepress = path.join(
  root,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'vitepress.cmd' : 'vitepress',
);

export function buildSite(base: string, outDir: string) {
  execFileSync(vitepress, ['build', 'apps/docs2', '--base', base, '--outDir', outDir], {
    cwd: root,
    stdio: 'inherit',
  });
}

function buildCheck() {
  buildSite('/', dist);
  buildSite('/__check__/', path.join(dist, '__check__'));
}

if (require.main === module) buildCheck();

export { dist, root };
