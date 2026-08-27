import fs from 'node:fs';
import path from 'node:path';

export interface ReleasePackage {
  project: string;
  name: string;
  peerDependencies: string[];
  sourceDir: string;
  sourceManifest: string;
  distDir: string;
  schematics: boolean;
}

export const root = path.resolve(__dirname, '../..');
const libraries = path.join(root, 'libs');

export const packages = sortByPeerDependencies(
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

function sortByPeerDependencies(packages: ReleasePackage[]): ReleasePackage[] {
  const byName = new Map(packages.map(pkg => [pkg.name, pkg]));
  const sorted: ReleasePackage[] = [];
  const seen = new Set<string>();
  const add = (pkg: ReleasePackage) => {
    if (seen.has(pkg.name)) return;
    seen.add(pkg.name);
    pkg.peerDependencies
      .map(name => byName.get(name))
      .filter((dependency): dependency is ReleasePackage => Boolean(dependency))
      .forEach(add);
    sorted.push(pkg);
  };
  packages.sort((a, b) => a.name.localeCompare(b.name)).forEach(add);
  return sorted;
}

export const localRegistry = 'http://127.0.0.1:4873';
export const localRegistryNpmrc = path.join(root, '.local-registry', 'npmrc');
export const npmCache = path.join(root, 'dist', '.npm-cache');
