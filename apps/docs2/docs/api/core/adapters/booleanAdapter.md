---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/boolean.adapter.ts#L44
---

# Variable: booleanAdapter

> `const` **booleanAdapter**: `InitializedAdapter`\<`boolean`, `Selectors`\<`boolean`\>, \{ `setFalse`: () => `false`; `setTrue`: () => `true`; `toggle`: (`state`) => `boolean`; \}\>

Defined in: [adapters/src/lib/boolean.adapter.ts:44](https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/boolean.adapter.ts#L44)

Changes boolean state with `setTrue`, `setFalse`, or `toggle`.

#### Usage with React

```tsx
import { useAdapt } from '@state-adapt/react';
import { booleanAdapter } from '@state-adapt/core/adapters';

export function Toggle() {
  const [enabled, actions] = useAdapt(false, booleanAdapter);

  return (
    <button onClick={() => actions.toggle()}>
      {enabled.state ? 'On' : 'Off'}
    </button>
  );
}
```

#### Usage with Angular

```typescript
import { Component } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { booleanAdapter } from '@state-adapt/core/adapters';

@Component({
  standalone: true,
  selector: 'app-toggle',
  template: `
    <button (click)="enabled.toggle()">
      {{ enabled() ? 'On' : 'Off' }}
    </button>
  `,
})
export class ToggleComponent {
  enabled = adapt(false, booleanAdapter);
}
```
