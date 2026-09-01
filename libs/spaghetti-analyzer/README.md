# @state-adapt/spaghetti-analyzer

Analyze a TypeScript project for spaghetti code and produce human-readable or JSON reports.

## Setup

```sh
npm install --save-dev @state-adapt/spaghetti-analyzer @state-adapt/spaghetti-core
```

Analyze the current project:

```sh
npx spaghetti-analyzer .
```

Use `--json` for machine-readable output, `--compact` for compact JSON, and
`--top` to control the number of ranked results. Run
`npx spaghetti-analyzer --help` for all CLI options.

The package also exports functions for creating, formatting, and visualizing
reports programmatically.

See the [API reference](https://state-adapt.github.io/api/spaghetti-analyzer/index/) for the programmatic API.
