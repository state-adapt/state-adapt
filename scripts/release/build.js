const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const { packages, root } = require('./config');

for (const pkg of packages) {
  fs.rmSync(pkg.distDir, { force: true, recursive: true });
}

run('npx', [
  'nx',
  'run-many',
  '--target=build',
  `--projects=${packages.map(pkg => pkg.project).join(',')}`,
  '--configuration=production',
  '--skip-nx-cache',
]);

for (const pkg of packages.filter(pkg => pkg.schematics)) {
  run('npx', ['tsc', '-p', path.join(pkg.sourceDir, 'tsconfig.schematics.json')]);
  copySchematicAssets(
    path.join(pkg.sourceDir, 'schematics'),
    path.join(pkg.distDir, 'schematics'),
  );
}

for (const pkg of packages) {
  fs.copyFileSync(`${root}/README.md`, `${pkg.distDir}/README.md`);
  fs.copyFileSync(`${root}/CHANGELOG.md`, `${pkg.distDir}/CHANGELOG.md`);
}

run('node', ['scripts/generate-package-skills.js']);

const badReferences = packages.flatMap(pkg => findDistReferences(pkg.distDir));
if (badReferences.length) {
  console.error(`Found ../dist references in:\n${badReferences.join('\n')}`);
  process.exit(1);
}

console.log('Release build complete.');

function findDistReferences(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return findDistReferences(file);
    return fs.readFileSync(file, 'utf8').includes('../dist')
      ? [path.relative(root, file)]
      : [];
  });
}

function copySchematicAssets(source, destination) {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destinationPath, { recursive: true });
      copySchematicAssets(sourcePath, destinationPath);
    } else if (!entry.name.endsWith('.ts')) {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

function run(command, args) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  execFileSync(command, args, {
    cwd: root,
    env: {
      ...process.env,
      NX_DAEMON: 'false',
      NX_ISOLATE_PLUGINS: 'false',
    },
    stdio: 'inherit',
  });
}
