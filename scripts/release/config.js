const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const libraries = path.join(root, 'libs');

const packages = sortByPeerDependencies(
  fs
    .readdirSync(libraries, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .flatMap(({ name: project }) => {
      const sourceDir = path.join(libraries, project);
      const sourceManifest = path.join(sourceDir, 'package.json');
      if (!fs.existsSync(sourceManifest)) return [];

      const manifest = JSON.parse(fs.readFileSync(sourceManifest, 'utf8'));
      if (manifest.private !== false) return [];

      return [
        {
          project,
          name: manifest.name,
          peerDependencies: Object.keys(manifest.peerDependencies ?? {}),
          sourceDir,
          sourceManifest,
          distDir: path.join(root, 'dist', 'libs', project),
          schematics: fs.existsSync(path.join(sourceDir, 'tsconfig.schematics.json')),
        },
      ];
    }),
);

function sortByPeerDependencies(packages) {
  const byName = new Map(packages.map(pkg => [pkg.name, pkg]));
  const sorted = [];
  const seen = new Set();
  const add = pkg => {
    if (seen.has(pkg.name)) return;
    seen.add(pkg.name);
    pkg.peerDependencies
      .map(name => byName.get(name))
      .filter(Boolean)
      .forEach(add);
    sorted.push(pkg);
  };
  packages.sort((a, b) => a.name.localeCompare(b.name)).forEach(add);
  return sorted;
}

module.exports = {
  localRegistry: 'http://127.0.0.1:4873',
  localRegistryNpmrc: path.join(root, '.local-registry', 'npmrc'),
  npmCache: path.join(root, 'dist', '.npm-cache'),
  packages,
  root,
};
