---
definedIn: 
---

# Function: derive()

> **derive**\<`Value`\>(`projector`): `Derived`\<`Value`\>

Defined in: lib/derive.function.ts:109

Creates a shared, memoized value derived from stores created with
[adapt](adapt.md). Call it for its current value, or subscribe a component to it
with [useDerived](useDerived.md).

Define it outside your components:

```tsx
import { adapt, derive, useDerived } from '@state-adapt/react';

const priceStore = adapt(20);
const quantityStore = adapt(3);

const deriveSubtotal = derive(() => priceStore() * quantityStore());
const deriveTotal = derive(() => deriveSubtotal() + 5);

function Total() {
  const total = useDerived(deriveTotal);

  return <p>Total: {total}</p>;
}
```

## Type Parameters

### Value

`Value`

## Parameters

### projector

() => `Value`

## Returns

`Derived`\<`Value`\>
