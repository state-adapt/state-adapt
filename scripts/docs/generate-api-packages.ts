import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docsRoot = path.join(root, 'apps/docs2/docs');
const apiRoot = path.join(docsRoot, 'api');
const output = path.join(apiRoot, 'packages.json');

const packages = getCuratedPackagePages()
  .sort((a, b) => a.order - b.order || Number(b.primary) - Number(a.primary))
  .map(({ name, link, description }) => ({ name, link, description }));

fs.writeFileSync(output, `${JSON.stringify(packages, null, 2)}\n`);

function getCuratedPackagePages() {
  const manifests = getPublicManifests();
  const order = JSON.parse(
    fs.readFileSync(path.join(apiRoot, 'typedoc/typedoc-sidebar.json'), 'utf8'),
  ).map(({ text }: { text: string }) => text);

  return findFiles(apiRoot)
    .filter(file => path.basename(file) === 'index.md' && !file.includes('/typedoc/'))
    .map(file => ({ file, name: fs.readFileSync(file, 'utf8').match(/^# Package: (.+)$/m)?.[1] }))
    .filter((page): page is { file: string; name: string } => Boolean(page.name))
    .map(({ file, name }) => {
      const baseName = name.split('/').slice(0, 2).join('/');
      const manifest = manifests.find(({ name: manifestName }) => manifestName === baseName);
      if (!manifest) return null;

      const packageRoot = path.dirname(manifest.file);
      const subpath = name.slice(baseName.length + 1);
      const subpathReadme = path.join(packageRoot, subpath, 'README.md');
      const readme = fs.existsSync(subpathReadme)
        ? subpathReadme
        : path.join(packageRoot, 'README.md');

      return {
        name,
        link: `/${path.relative(docsRoot, path.dirname(file)).split(path.sep).join('/')}/`,
        description: readmeDescription(readme),
        order: order.indexOf(baseName),
        primary: !subpath || subpath === 'src',
      };
    })
    .filter((pkg): pkg is NonNullable<typeof pkg> => Boolean(pkg));
}

function getPublicManifests() {
  return fs
    .readdirSync(path.join(root, 'libs'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(root, 'libs', entry.name, 'package.json'))
    .filter(fs.existsSync)
    .map(file => ({ file, ...JSON.parse(fs.readFileSync(file, 'utf8')) }))
    .filter(({ private: isPrivate }) => isPrivate === false);
}

function readmeDescription(file: string) {
  return fs
    .readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .find(line => line.trim() && !line.trim().startsWith('#'))
    ?.trim() ?? '';
}

function findFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? findFiles(file) : file;
  });
}
