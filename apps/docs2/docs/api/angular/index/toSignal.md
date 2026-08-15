---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/to-signal.function.ts#L53
---

# Function: toSignal()

> **toSignal**\<`State`\>(`source$`, `__namedParameters`): `Signal`\<`State`\>

Defined in: [angular/src/lib/to-signal.function.ts:53](https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/to-signal.function.ts#L53)

Converts an observable to a signal without keeping the source observable
subscribed to when no Angular consumer is reading the signal.

Signals created in a component, directive, or locally provided service are
subscribed to immediately and unsubscribed from with that view. Signals created in a
root injection context are subscribed to only while a template or effect keeps
reading them.

### Example: Basic usage

```ts
const name = toSignal(name$, { initialValue: 'John' });
```

### Example: Initial value factory

`initialValue` can be a function that returns the value. The signal calls it when it
subscribes, keeps that value until it unsubscribes, and discards it then — so the factory
runs again for each subscription.

This helps when the initial value might be different at each time the signal is being used,
like with `localStorage`:

```ts
const name = toSignal(name$, {
  initialValue: () => localStorage.getItem('name') ?? 'John',
});
```

A read while the signal is unsubscribed will not use a cached value, but call the factory function.

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
