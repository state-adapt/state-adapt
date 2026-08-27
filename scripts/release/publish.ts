import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { localRegistry, localRegistryNpmrc, npmCache, packages, root } from './config';

type PublishStatus = 'published' | 'skipped' | 'would publish';

interface PublishResult {
  name: string;
  status: PublishStatus;
}

const args = process.argv.slice(2);
const registryIndex = args.indexOf('--registry');
const registryArgument = registryIndex === -1 ? undefined : args[registryIndex + 1];
const dryRun = args.includes('--dry-run');
const tagIndex = args.indexOf('--tag');
const explicitTag = tagIndex === -1 ? null : args[tagIndex + 1];
const version: string = JSON.parse(
  fs.readFileSync(packages[0].sourceManifest, 'utf8'),
).version;

if (!registryArgument) fail('--registry <url> is required.');
if (tagIndex !== -1 && !explicitTag) fail('--tag requires a value.');
const registry: string = registryArgument;

// npm's own default is `latest`. Naming it explicitly means a skipped package
// has a tag to be reconciled against, and leaves one obvious place to teach the
// script that prereleases belong on `next`.
const tag = explicitTag || 'latest';

const env: NodeJS.ProcessEnv = { ...process.env, npm_config_cache: npmCache };
if (registry === localRegistry) env.npm_config_userconfig = localRegistryNpmrc;

// Publishing is one `npm publish` per package with no transaction around it, so
// a failure partway through leaves some packages live and some not. Re-running
// the same command is the recovery path: anything already on the registry is
// verified byte-for-byte and skipped, and the rest are published.
const results: PublishResult[] = [];

for (const pkg of packages) {
  const tarball = path.join(
    pkg.distDir,
    `${pkg.name.replace(/^@/, '').replace('/', '-')}-${version}.tgz`,
  );

  if (!fs.existsSync(tarball)) {
    fail(
      `${path.relative(root, tarball)} does not exist. ` +
        'Run npm run release:build && npm run release:pack first.',
    );
  }

  const publishedSha = publishedShasum(pkg.name);

  if (publishedSha) {
    const localSha = shasum(tarball);

    // Same version, different bytes: something was rebuilt between the failed
    // run and this one. Skipping would ship a set assembled from two builds,
    // and npm will not let the published version be replaced.
    if (publishedSha !== localSha) {
      console.error(`\n${pkg.name}@${version} is published, but from a different build.`);
      console.error(`  registry ${publishedSha}`);
      console.error(`  local    ${localSha}`);
      fail('Bump the version and start over — a published version cannot be replaced.');
    }

    console.log(`= ${pkg.name}@${version} already published — skipping`);
    if (!dryRun) reconcileTag(pkg.name);
    results.push({ name: pkg.name, status: 'skipped' });
    continue;
  }

  const publishArgs = [
    'publish',
    tarball,
    '--access',
    'public',
    '--registry',
    registry,
    '--tag',
    tag,
  ];
  if (dryRun) publishArgs.push('--dry-run');

  run(publishArgs, 'inherit');
  results.push({ name: pkg.name, status: dryRun ? 'would publish' : 'published' });
}

summarize();

// Returns the sha1 the registry holds for this exact version, or null when the
// version is not published. Anything else — offline, auth, a 5xx — is fatal,
// because treating it as "not published" would republish over a live version.
function publishedShasum(name: string): string | null {
  try {
    return run(
      [
        'view',
        `${name}@${version}`,
        'dist.shasum',
        '--registry',
        registry,
        '--prefer-online',
      ],
      ['ignore', 'pipe', 'pipe'],
    ).trim();
  } catch (error: unknown) {
    const stderr =
      error && typeof error === 'object' && 'stderr' in error
        ? String(error.stderr || '')
        : '';
    if (/E404/.test(stderr)) return null;
    console.error(stderr.trim());
    fail(`Could not determine whether ${name}@${version} is published.`);
  }
}

// A skipped package kept whatever tag the failed run gave it, so a resumed run
// has to re-point it. `npm dist-tag add` is idempotent.
function reconcileTag(name: string): void {
  run(['dist-tag', 'add', `${name}@${version}`, tag, '--registry', registry], 'inherit');
}

function shasum(file: string): string {
  return crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex');
}

function summarize(): void {
  const counts = results.reduce<Record<PublishStatus, number>>(
    (totals, { status }) => {
      totals[status] = (totals[status] || 0) + 1;
      return totals;
    },
    { published: 0, skipped: 0, 'would publish': 0 },
  );

  console.log(`\n${version} on ${registry} (tag: ${tag})`);
  for (const { name, status } of results) {
    console.log(`  ${name.padEnd(28)} ${status}`);
  }
  console.log(
    Object.entries(counts)
      .map(([status, count]) => `${count} ${status}`)
      .join(', '),
  );
}

function run(npmArgs: string[], stdio: 'inherit' | ['ignore', 'pipe', 'pipe']): string {
  return execFileSync('npm', npmArgs, { cwd: root, env, encoding: 'utf8', stdio });
}

function fail(message: string): never {
  console.error(`Release publish failed: ${message}`);
  process.exit(1);
}
