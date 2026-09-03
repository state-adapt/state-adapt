---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L26
---

# Interface: SpaghettiReport

Defined in: [lib/report-models.ts:26](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L26)

A complete analyzer report, including ranked visualization datasets.

## Properties

### directoryScores

> **directoryScores**: [`DirectoryScore`](DirectoryScore.md)[]

Defined in: [lib/report-models.ts:30](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L30)

Aggregate scores for directories containing analyzed files.

***

### functionScores

> **functionScores**: `Pick`\<`FunctionAnalysis`, `"name"` \| `"functionId"` \| `"size"` \| `"score"`\>[]

Defined in: [lib/report-models.ts:32](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L32)

Functions ordered from highest to lowest score.

***

### project

> **project**: `ProjectAnalysis`

Defined in: [lib/report-models.ts:28](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L28)

Complete project analysis used to create the report.

***

### visualizations

> **visualizations**: [`VisualizationDatasets`](VisualizationDatasets.md)

Defined in: [lib/report-models.ts:34](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L34)

Ranked datasets for charts, tables, or custom dashboards.
