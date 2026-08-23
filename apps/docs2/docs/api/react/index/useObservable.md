---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/use-observable.ts#L24
---

# Function: useObservable()

> **useObservable**\<`T`, `Args`\>(`obs$`, ...`args`): `Args` *extends* \[\] ? `undefined` \| `T` : `T`

Defined in: [lib/use-observable.ts:24](https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/use-observable.ts#L24)

Subscribes the component to an observable and returns its latest value.

Until the observable emits, the hook returns `undefined` or the provided
initial value. The initial value is also used during server rendering.

```tsx
import { useObservable } from '@state-adapt/react';
import { interval } from 'rxjs';

const tick$ = interval(1000);

function Timer() {
  const tick = useObservable(tick$);

  return <p>{tick}</p>;
}
```

## Type Parameters

### T

`T`

### Args

`Args` *extends* \[\] \| \[`NoInfer`\<`T`\>\]

## Parameters

### obs$

`Observable`\<`T`\>

### args

...`Args`

## Returns

`Args` *extends* \[\] ? `undefined` \| `T` : `T`
