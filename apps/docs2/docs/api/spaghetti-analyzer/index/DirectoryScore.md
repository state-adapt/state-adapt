---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L14
---

# Interface: DirectoryScore

Defined in: [lib/report-models.ts:14](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L14)

Aggregate score for one directory.

## Properties

### commands

> **commands**: `number`

Defined in: [lib/report-models.ts:22](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L22)

Number of commands found in the directory.

***

### directory

> **directory**: `string`

Defined in: [lib/report-models.ts:16](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L16)

Directory path relative to the analyzed project root.

***

### files

> **files**: `number`

Defined in: [lib/report-models.ts:20](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L20)

Number of analyzed files in the directory.

***

### score

> **score**: `number`

Defined in: [lib/report-models.ts:18](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L18)

Sum of file scores in the directory.
