import fs from 'node:fs';
import path from 'node:path';

import { root } from './config';

const registryDirectory = path.join(root, '.local-registry');
fs.rmSync(registryDirectory, { force: true, recursive: true });
console.log(`Removed ${path.relative(root, registryDirectory)}.`);
