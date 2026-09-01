---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L80
---

# Interface: VisualizationDatasets

Defined in: [lib/report-models.ts:80](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L80)

Ranked datasets ready for tables, charts, or custom dashboards.

## Properties

### highestScoringFiles

> **highestScoringFiles**: `object`[]

Defined in: [lib/report-models.ts:92](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L92)

Files with the highest aggregate scores.

#### commands

> **commands**: `number`

#### filePath

> **filePath**: `string`

#### score

> **score**: `number`

***

### highestScoringFunctions

> **highestScoringFunctions**: `object`[]

Defined in: [lib/report-models.ts:84](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L84)

Functions with the highest aggregate scores.

#### commands

> **commands**: `number`

#### filePath

> **filePath**: `string`

#### functionId

> **functionId**: `string`

#### name

> **name**: `string`

#### score

> **score**: `number`

***

### hotspots

> **hotspots**: [`RankedCommand`](RankedCommand.md)[]

Defined in: [lib/report-models.ts:82](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L82)

Commands with the highest spaghetti scores.

***

### largestCommandDistances

> **largestCommandDistances**: [`RankedCommand`](RankedCommand.md)[]

Defined in: [lib/report-models.ts:96](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L96)

Commands with the largest total distance.

***

### longestCommandChains

> **longestCommandChains**: [`RankedCommand`](RankedCommand.md)[]

Defined in: [lib/report-models.ts:94](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L94)

Commands with the longest propagated call chains.

***

### scoreTrend

> **scoreTrend**: [`HistoricalSnapshot`](HistoricalSnapshot.md) & `object`[]

Defined in: [lib/report-models.ts:98](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L98)

Caller-provided historical scores plus the current score and deltas.
