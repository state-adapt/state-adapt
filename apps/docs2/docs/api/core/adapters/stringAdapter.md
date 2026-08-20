---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/string.adapter.ts#L45
---

# Variable: stringAdapter

> `const` **stringAdapter**: `InitializedAdapter`\<`string`, \{ `lowercase`: (`str`) => `string`; `uppercase`: (`str`) => `string`; \}, \{ `concat`: (`str`, `str2`) => `string`; `lowercase`: (`str`) => `string`; `selectors`: \{ `lowercase`: (`str`) => `string`; `uppercase`: (`str`) => `string`; \}; `uppercase`: (`str`) => `string`; \}\>

Defined in: [adapters/src/lib/string.adapter.ts:45](https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/string.adapter.ts#L45)

Common reactions and selectors for string state.

The `lowercase` and `uppercase` names are available as both reactions and
selectors.

#### Usage with React

```tsx
import { useAdapt } from '@state-adapt/react';
import { stringAdapter } from '@state-adapt/core/adapters';

export function Label() {
  const [text, actions] = useAdapt('State', stringAdapter);

  return (
    <button onClick={() => actions.concat('Adapt')}>
      {text.uppercase}
    </button>
  );
}
```

#### Usage with Angular

```typescript
import { Component } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { stringAdapter } from '@state-adapt/core/adapters';

@Component({
  standalone: true,
  selector: 'app-label',
  template: `
    <button (click)="text.concat('Adapt')">{{ text.uppercase() }}</button>
  `,
})
export class LabelComponent {
  text = adapt('State', stringAdapter);
}
```
