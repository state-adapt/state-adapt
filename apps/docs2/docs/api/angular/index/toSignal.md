---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/to-signal.function.ts#L28
---

# Function: toSignal()

> **toSignal**\<`State`\>(`source$`, `__namedParameters`): `Signal`\<`State`\>

Defined in: [angular/src/lib/to-signal.function.ts:28](https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/to-signal.function.ts#L28)

Converts an observable to a signal without keeping the source observable
subscribed to when no Angular consumer is reading the signal.

Signals created in a component, directive, or locally provided service are
subscribed to immediately and unsubscribed from with that view. Signals created in a
root injection context are subscribed to only while a template or effect keeps
reading them.

## Type Parameters

### State

`State`

## Parameters

### source$

`Observable`\<`State`\>

### \_\_namedParameters

`ToSignalOptions`\<`State`\>

## Returns

`Signal`\<`State`\>
