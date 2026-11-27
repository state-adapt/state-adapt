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

## API Configuration

Use a JSON config to recognize a project API and assign its starting penalty:

```json
{
  "apis": [
    {
      "name": "Router.navigate",
      "methods": ["navigate"],
      "importSources": ["@app/router"],
      "penalty": 5
    }
  ]
}
```

```sh
npx spaghetti-analyzer . --config spaghetti.json
```

See the [API reference](https://state-adapt.github.io/api/spaghetti-analyzer/index/) for the programmatic API.
