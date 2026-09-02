# Library Publishing

## Test

```bash
npm test
npm run e2e
npm run docs2:check
```

```bash
npx nx serve docs2
```

- Check `/` and `/__check__/`.
- Click through the adapter docs.

## Version

Dry run:

```bash
npm run release:version -- patch --dry-run
```

```bash
npm run release:version -- minor --dry-run
```

```bash
npm run release:version -- major --dry-run
```

Real:

```bash
npm run release:version -- patch
```

```bash
npm run release:version -- minor
```

```bash
npm run release:version -- major
```

The version script verifies that all package versions agree and updates exact internal peer-dependency pins.

```bash
git diff
```

## Build

```bash
npm run release:build
```

If the build reports a `../dist` reference, make sure every library used by an exported source type or value is represented by an exported import. An otherwise-unused import may be needed as a build hint.

## Pack

```bash
npm run release:pack
```

## Test from a local registry

If the version was already published locally, stop the registry and reset it:

```bash
npm run release:registry:reset
```

Open two terminal tabs, both at the StateAdapt repository root.
Terminal 1 runs the local registry. Leave it running while testing:

```bash
npm run release:registry
```

Terminal 2 creates credentials for that running registry and publishes the packages to it:

```bash
npm run release:registry:login
npm run release:publish:local
```

Add to the test application's `.npmrc`:

```ini
@state-adapt:registry=http://127.0.0.1:4873
```

Angular:

```bash
VERSION=$(npm view @state-adapt/core version --registry http://127.0.0.1:4873 --prefer-online) &&
npm install --save-exact --prefer-online \
  "@state-adapt/core@$VERSION" \
  "@state-adapt/rxjs@$VERSION" \
  "@state-adapt/angular@$VERSION" \
  "@state-adapt/angular-router@$VERSION" &&
npm install --save-dev --save-exact --prefer-online \
  "@state-adapt/spaghetti-core@$VERSION" \
  "@state-adapt/eslint-plugin-spaghetti@$VERSION"
```

React:

```bash
VERSION=$(npm view @state-adapt/core version --registry http://127.0.0.1:4873 --prefer-online) &&
npm install --save-exact --prefer-online \
  "@state-adapt/core@$VERSION" \
  "@state-adapt/rxjs@$VERSION" \
  "@state-adapt/react@$VERSION" &&
npm install --save-dev --save-exact --prefer-online \
  "@state-adapt/spaghetti-core@$VERSION" \
  "@state-adapt/eslint-plugin-spaghetti@$VERSION"
```

- Test the application.
- Remove the `@state-adapt:registry` line from `.npmrc` when finished.

## Commit and tag

```bash
npm run release:commit
```

## Publish

Dry run:

```bash
npm run release:publish -- --dry-run
```

For past major versions:

```bash
npm run release:publish -- --tag legacy
```

New:

```bash
npm run release:publish
```

If publish fails partway through, run the same command again—packages already on the registry are verified byte-for-byte and skipped.
If one was published from a different build, it stops and tells you to bump the version, so don't rebuild between attempts.

```bash
VERSION=$(node -p "require('./libs/core/package.json').version")
git push origin HEAD
git push origin "v$VERSION"
```

Publish the matching documentation using [docs-publishing.md](./docs-publishing.md).
