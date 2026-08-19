const fs = require('node:fs');

const { packages } = require('./config');

const args = process.argv.slice(2);
const specifier = args.find(arg => !arg.startsWith('--'));
const dryRun = args.includes('--dry-run');

if (!['patch', 'minor', 'major'].includes(specifier)) {
  fail('Usage: npm run release:version -- <patch|minor|major> [--dry-run]');
}

const sourceManifests = packages.map(pkg => ({
  ...pkg,
  manifest: readJson(pkg.sourceManifest),
}));
const currentVersion = sourceManifests[0].manifest.version;

for (const pkg of sourceManifests) {
  if (pkg.manifest.version !== currentVersion) {
    fail(
      `${pkg.name} is ${pkg.manifest.version}, but the workspace is ${currentVersion}. ` +
        'Make the versions consistent before releasing.',
    );
  }
}

const newVersion = resolveVersion(currentVersion, specifier);

for (const pkg of sourceManifests) {
  pkg.manifest.version = newVersion;
  updateInternalDependencies(pkg.manifest, newVersion);
  if (pkg.manifest['ng-update']?.packageGroup) {
    pkg.manifest['ng-update'].packageGroup = packages.map(({ name }) => name);
  }
}

if (dryRun) {
  console.log(`StateAdapt ${currentVersion} -> ${newVersion}`);
  process.exit(0);
}

for (const pkg of sourceManifests) writeJson(pkg.sourceManifest, pkg.manifest);

console.log(`StateAdapt ${currentVersion} -> ${newVersion}`);

function updateInternalDependencies(manifest, version) {
  for (const dependency of Object.keys(manifest.peerDependencies || {})) {
    if (dependency.startsWith('@state-adapt/')) {
      manifest.peerDependencies[dependency] = version;
    }
  }
}

function resolveVersion(current, requested) {
  const [major, minor, patch] = current.split('.').map(Number);

  if (requested === 'major') return `${major + 1}.0.0`;
  if (requested === 'minor') return `${major}.${minor + 1}.0`;
  if (requested === 'patch') return `${major}.${minor}.${patch + 1}`;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function fail(message) {
  console.error(`Release version failed: ${message}`);
  process.exit(1);
}
