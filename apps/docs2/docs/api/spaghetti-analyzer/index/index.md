<script setup>
  import { sections } from './sections';
</script>

# Package: @state-adapt/spaghetti-analyzer

Analyze a TypeScript project for spaghetti code and produce human-readable or JSON reports.

## Install

```sh
npm install --save-dev @state-adapt/spaghetti-analyzer @state-adapt/spaghetti-core
```

## CLI

Analyze the current project:

```sh
npx spaghetti-analyzer .
```

Use `--json` for machine-readable output, `--compact` for compact JSON, and `--top` to control the number of ranked results:

```sh
npx spaghetti-analyzer . --json --top 20
```

Additional options include `--config`, `--history`, and `--label`. Run `npx spaghetti-analyzer --help` for the complete CLI syntax.

For example, a JSON config can customize analysis and report ranking together:

```json
{
  "crossFileAnalysis": true,
  "scoring": {
    "scopeCrossingWeight": 2,
    "fileCrossingWeight": 4,
    "folderCrossingWeight": 8
  },
  "report": {
    "top": 20
  }
}
```

```sh
npx spaghetti-analyzer . --config spaghetti.config.json
```

## Programmatic usage

```ts
import { createReport, formatHumanReport } from '@state-adapt/spaghetti-analyzer';

const report = createReport(process.cwd());
console.log(formatHumanReport(report));
```

<template v-for="(section, index) in sections">

  ## {{ section.name }}

  <ul>
    <li v-for="item in section.items" :key="item.def.symbol">
      <a :href="item.def.link">{{ item.def.symbol }}</a>
    </li>
  </ul>
</template>
