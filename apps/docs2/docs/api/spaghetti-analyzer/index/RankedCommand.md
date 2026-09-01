---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L60
---

# Interface: RankedCommand

Defined in: [lib/report-models.ts:60](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L60)

A command projected into a sortable visualization row.

## Properties

### chainLength

> **chainLength**: `number`

Defined in: [lib/report-models.ts:74](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L74)

Number of calls between the reported function and the command.

---

### distance

> **distance**: `number`

Defined in: [lib/report-models.ts:72](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L72)

Sum of the command's unweighted distance dimensions.

---

### filePath

> **filePath**: `string`

Defined in: [lib/report-models.ts:66](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L66)

Source file containing the command.

---

### functionId

> **functionId**: `string`

Defined in: [lib/report-models.ts:62](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L62)

Stable identifier of the function containing the command.

---

### functionName

> **functionName**: `string`

Defined in: [lib/report-models.ts:64](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L64)

Display name of the function containing the command.

---

### kind

> **kind**: `string`

Defined in: [lib/report-models.ts:68](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L68)

Detected command kind.

---

### originFunction

> **originFunction**: `string`

Defined in: [lib/report-models.ts:76](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L76)

Function where the command originates.

---

### score

> **score**: `number`

Defined in: [lib/report-models.ts:70](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L70)

Aggregate spaghetti score for the command.
