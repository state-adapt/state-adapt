---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/number.adapter.ts#L94
---

# Variable: baseNumberAdapter

> `const` **baseNumberAdapter**: `InitializedAdapter`\<`number`, \{ \}, \{ `selectors`: \{ \}; \}\>

Defined in: [adapters/src/lib/number.adapter.ts:94](https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/number.adapter.ts#L94)

A number adapter with only the default `set` and `reset` reactions.

#### Usage with React

```tsx
import { useAdapt } from '@state-adapt/react';
import { baseNumberAdapter } from '@state-adapt/core/adapters';

export function Counter() {
  const [count, setCount] = useAdapt(0, baseNumberAdapter);

  return (
    <button onClick={() => setCount(count.state + 1)}>
      Count: {count.state}
    </button>
  );
}
```

#### Usage with Angular

```typescript
import { Component } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { baseNumberAdapter } from '@state-adapt/core/adapters';

@Component({
  standalone: true,
  selector: 'app-counter',
  template: `
    <button (click)="count.set(count() + 1)">Count: {{ count() }}</button>
  `,
})
export class CounterComponent {
  count = adapt(0, baseNumberAdapter);
}
```
