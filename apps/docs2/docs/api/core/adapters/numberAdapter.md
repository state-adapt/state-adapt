---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/number.adapter.ts#L42
---

# Variable: numberAdapter

> `const` **numberAdapter**: `InitializedAdapter`\<`number`, `Selectors`\<`number`\>, \{ `add`: (`n`, `n2`) => `number`; `decrement`: (`n`) => `number`; `divide`: (`n`, `n2`) => `number`; `increment`: (`n`) => `number`; `max`: (`n`, `n2`) => `number`; `min`: (`n`, `n2`) => `number`; `multiply`: (`n`, `n2`) => `number`; `pow`: (`n`, `pow`) => `number`; `sqrt`: (`n`) => `number`; `subtract`: (`n`, `n2`) => `number`; \}\>

Defined in: [adapters/src/lib/number.adapter.ts:42](https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/number.adapter.ts#L42)

Common reactions for number state, including arithmetic helpers.

#### Usage with React

```tsx
import { useAdapt } from '@state-adapt/react';
import { numberAdapter } from '@state-adapt/core/adapters';

export function Counter() {
  const [count, actions] = useAdapt(0, numberAdapter);

  return (
    <button onClick={() => actions.increment()}>
      Count: {count.state}
    </button>
  );
}
```

#### Usage with Angular

```typescript
import { Component } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { numberAdapter } from '@state-adapt/core/adapters';

@Component({
  standalone: true,
  selector: 'app-counter',
  template: `
    <button (click)="count.increment()">Count: {{ count() }}</button>
  `,
})
export class CounterComponent {
  count = adapt(0, numberAdapter);
}
```
