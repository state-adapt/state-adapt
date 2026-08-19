const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const { buildSite, root } = require('./build');

const mode = process.argv[2];
if (!['current', 'versioned'].includes(mode)) {
  fail('Usage: node scripts/docs/publish.js <current|versioned>');
}

const pagesRoot = path.resolve(root, '../state-adapt.github.io');
const version = require(path.join(root, 'libs/core/package.json')).version;
const major = version.split('.')[0];
const versionLinks = readVersionLinks();

if (mode === 'current') verifyCurrentVersion();
run('npm', 'run', 'typedoc');

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'state-adapt-docs-'));

try {
  const site = path.join(temporaryRoot, 'site');
  const versionedSite = path.join(site, 'v', major);

  if (mode === 'current') {
    buildSite('/', site);
  }

  buildSite(`/v/${major}/`, versionedSite);

  if (mode === 'current') syncRoot(site, pagesRoot);
  replaceDirectory(versionedSite, path.join(pagesRoot, 'v', major));
  writeVersionLinks(versionLinks);

  runInPagesRepo('add', '.');
  runInPagesRepo('commit', '-m', `Update docs for v${version}`);
  runInPagesRepo('push', 'origin', 'master');
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

function verifyCurrentVersion() {
  const latest = execFileSync(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['view', '@state-adapt/core', 'version', '--registry', 'https://registry.npmjs.org'],
    { cwd: root, encoding: 'utf8' },
  ).trim();

  if (version !== latest) {
    fail(
      `@state-adapt/core ${version} is not npm latest (${latest}). ` +
        'Use docs2:publish:versioned for an older release.',
    );
  }
}

function syncRoot(source, destination) {
  const keep = new Set(['.git', 'versions', 'v']);

  for (const entry of fs.readdirSync(destination, { withFileTypes: true })) {
    if (!keep.has(entry.name)) {
      fs.rmSync(path.join(destination, entry.name), { recursive: true, force: true });
    }
  }

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name !== 'v') {
      copy(path.join(source, entry.name), path.join(destination, entry.name));
    }
  }
}

function replaceDirectory(source, destination) {
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  copy(source, destination);
}

function readVersionLinks() {
  const published = path.join(pagesRoot, 'versions.json');
  const source = path.join(root, 'apps/docs2/docs/public/versions.json');
  return JSON.parse(
    fs.readFileSync(fs.existsSync(published) ? published : source, 'utf8'),
  );
}

function writeVersionLinks(links) {
  const isMajor = ({ link }) => /^\/v\/\d+\/$/.test(link);
  const latest = links.find(({ link }) => link === '/');
  const latestMajor = latest?.text.match(/^v(\d+)/)?.[1];
  const current = { text: `v${version}`, link: `/v/${major}/` };
  const majors = links.filter(link => isMajor(link) && link.link !== current.link);

  if (latest && latestMajor !== major) {
    majors.push({
      text: latest.text.replace(/ \(Latest\)$/, ''),
      link: `/v/${latestMajor}/`,
    });
  }

  if (mode === 'versioned' && latestMajor !== major) majors.push(current);

  majors.sort((a, b) => Number(b.link.split('/')[2]) - Number(a.link.split('/')[2]));
  const history = links.filter(link => link.link !== '/' && !isMajor(link));
  const latestLink =
    mode === 'current' ? { text: `v${version} (Latest)`, link: '/' } : latest;

  fs.writeFileSync(
    path.join(pagesRoot, 'versions.json'),
    `${JSON.stringify([latestLink, ...majors, ...history], null, 2)}\n`,
  );
}

function copy(source, destination) {
  fs.cpSync(source, destination, { recursive: true });
}

function run(command, ...args) {
  execFileSync(
    process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command,
    args,
    {
      cwd: root,
      stdio: 'inherit',
    },
  );
}

function runInPagesRepo(...args) {
  execFileSync('git', args, { cwd: pagesRoot, stdio: 'inherit' });
}

function fail(message) {
  console.error(`Docs publish failed: ${message}`);
  process.exit(1);
}
