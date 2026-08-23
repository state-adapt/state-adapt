---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/to-signal.function.ts#L67
---

# Function: toSignal()

> **toSignal**\<`State`\>(`source$`, `__namedParameters`): `Signal`\<`State`\>

Defined in: [libs/angular/src/lib/to-signal.function.ts:67](https://github.com/state-adapt/state-adapt/blob/main/libs/angular/src/lib/to-signal.function.ts#L67)

Converts an observable to a signal without keeping the source observable
subscribed to when no Angular consumer is reading the signal.

Signals created in a component, directive, or locally provided service are
subscribed to immediately and unsubscribed from with that view. Signals created in a
root injection context are subscribed to only while a template or effect keeps
reading them.

### Example: Basic usage

```ts
import { Injectable } from '@angular/core';
import { toSignal } from '@state-adapt/angular';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RandomService {
  random$ = interval(1000).pipe(map(() => Math.random()));
  random = toSignal(this.random$, { initialValue: 0 });
}
```

### Example: Initial value factory

`initialValue` can be a function that returns the value. The signal calls it when it
subscribes, keeps that value until it unsubscribes, and discards it then—so the factory
runs again for each subscription.

```ts
import { Injectable } from '@angular/core';
import { toSignal } from '@state-adapt/angular';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RandomService {
  random$ = interval(1000).pipe(map(() => Math.random()));
  random = toSignal(this.random$, { initialValue: () => Math.random() });
}
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
