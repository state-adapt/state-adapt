---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L48
---

# Interface: ReportOptions

Defined in: [lib/report-models.ts:48](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L48)

Options for ranking and labeling report visualization data.

## Properties

### currentLabel?

> `optional` **currentLabel**: `string`

Defined in: [lib/report-models.ts:54](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L54)

Label for the current project score. Defaults to `"current"`.

---

### currentTimestamp?

> `optional` **currentTimestamp**: `string`

Defined in: [lib/report-models.ts:56](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L56)

Optional timestamp for the current project score.

---

### history?

> `optional` **history**: [`HistoricalSnapshot`](HistoricalSnapshot.md)[]

Defined in: [lib/report-models.ts:52](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L52)

Caller-owned history. Reporting never writes snapshots implicitly.

---

### top?

> `optional` **top**: `number`

Defined in: [lib/report-models.ts:50](https://github.com/state-adapt/state-adapt/blob/main/libs/spaghetti-analyzer/src/lib/report-models.ts#L50)

Maximum rows in each ranked visualization dataset.
