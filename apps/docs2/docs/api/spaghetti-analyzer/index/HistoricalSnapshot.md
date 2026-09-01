---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L38
---

# Interface: HistoricalSnapshot

Defined in: [lib/report-models.ts:38](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L38)

A caller-owned score snapshot used to build a trend dataset.

## Properties

### label

> **label**: `string`

Defined in: [lib/report-models.ts:40](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L40)

Display name for this snapshot.

***

### score

> **score**: `number`

Defined in: [lib/report-models.ts:42](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L42)

Project score captured by the caller.

***

### timestamp?

> `optional` **timestamp**: `string`

Defined in: [lib/report-models.ts:44](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L44)

Optional timestamp supplied by the caller.
