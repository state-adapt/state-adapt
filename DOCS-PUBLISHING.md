# Docs Publishing

## Development

```bash
npm start
```

This generates TypeDoc, watches `libs` for changes, and starts the docs dev server.

## Check

```bash
npm run build
```

This runs TypeDoc, builds `/` into `apps/docs2/.vitepress/dist/`, and builds `/__check__/` into `apps/docs2/.vitepress/dist/__check__/`.

```bash
npx nx serve docs2
```

- Check `/` and `/__check__/`.
- Click through the adapter docs.

## Publish the current major

Publish the libraries first. The checked-out `@state-adapt/core` version must match npm's `latest` version.

```bash
npm run docs2:publish:current
```

This publishes the checkout to both `/` and `/v/<major>/`. Other major versions are unchanged. It commits and pushes the `state-adapt.github.io` repository.

## Publish a previous major

Check out the previous-major branch or commit. For a maintenance release, publish its libraries with the `legacy` npm tag first.

```bash
npm run docs2:publish:versioned
```

This publishes the checkout only to `/v/<major>/`. The root docs and other major versions are unchanged. It commits and pushes the `state-adapt.github.io` repository.

All VitePress versions load their version menu from `/versions.json`. Publishing updates the checkout's full version link text while keeping its `/v/<major>/` link stable.
