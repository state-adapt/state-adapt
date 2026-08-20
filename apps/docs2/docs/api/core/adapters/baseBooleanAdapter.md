---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/boolean.adapter.ts#L93
---

# Variable: baseBooleanAdapter

> `const` **baseBooleanAdapter**: `InitializedAdapter`\<`boolean`, `Selectors`\<`boolean`\>, \{ \}\>

Defined in: [adapters/src/lib/boolean.adapter.ts:93](https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/boolean.adapter.ts#L93)

A boolean adapter with only the default `set` and `reset` reactions.

Use this as a small building block with `joinAdapters`.

#### Usage with React

```tsx
import { useAdapt } from '@state-adapt/react';
import { baseBooleanAdapter } from '@state-adapt/core/adapters';

export function Toggle() {
  const [enabled, setEnabled] = useAdapt(false, baseBooleanAdapter);

  return (
    <button onClick={() => setEnabled(!enabled.state)}>
      {enabled.state ? 'On' : 'Off'}
    </button>
  );
}
```

#### Usage with Angular

```typescript
import { Component } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { baseBooleanAdapter } from '@state-adapt/core/adapters';

@Component({
  standalone: true,
  selector: 'app-toggle',
  template: `
    <button (click)="enabled.set(!enabled())">
      {{ enabled() ? 'On' : 'Off' }}
    </button>
  `,
})
export class ToggleComponent {
  enabled = adapt(false, baseBooleanAdapter);
}
```
