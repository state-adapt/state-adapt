const fs = require('node:fs');
const path = require('node:path');

const { root } = require('./config');

const registryDirectory = path.join(root, '.local-registry');
fs.rmSync(registryDirectory, { force: true, recursive: true });
console.log(`Removed ${path.relative(root, registryDirectory)}.`);
