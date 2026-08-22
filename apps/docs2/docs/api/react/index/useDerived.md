---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/use-derived.ts#L138
---

# Function: useDerived()

> **useDerived**\<`Value`\>(`derived`): `Value`

Defined in: [lib/use-derived.ts:138](https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/use-derived.ts#L138)

Subscribes a React component to a value created with [derive](derive.md).

```tsx
const deriveTotal = derive(() => priceStore() * quantityStore());

function Total() {
  const total = useDerived(deriveTotal);

  return <p>Total: {total}</p>;
}
```

`deriveTotal` is computed once per change, no matter how many components
subscribe.

## Type Parameters

### Value

`Value`

## Parameters

### derived

`Derived`\<`Value`\>

## Returns

`Value`
