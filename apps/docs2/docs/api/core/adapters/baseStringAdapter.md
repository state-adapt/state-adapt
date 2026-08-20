---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/string.adapter.ts#L98
---

# Variable: baseStringAdapter

> `const` **baseStringAdapter**: `InitializedAdapter`\<`string`, \{ \}, \{ `selectors`: \{ \}; \}\>

Defined in: [adapters/src/lib/string.adapter.ts:98](https://github.com/state-adapt/state-adapt/blob/main/libs/core/adapters/src/lib/string.adapter.ts#L98)

A string adapter with only the default `set` and `reset` reactions.

#### Usage with React

```tsx
import { useAdapt } from '@state-adapt/react';
import { baseStringAdapter } from '@state-adapt/core/adapters';

export function NameField() {
  const [name, setName] = useAdapt('', baseStringAdapter);

  return (
    <input
      value={name.state}
      onChange={event => setName(event.target.value)}
    />
  );
}
```

#### Usage with Angular

```typescript
import { Component } from '@angular/core';
import { adapt } from '@state-adapt/angular';
import { baseStringAdapter } from '@state-adapt/core/adapters';

@Component({
  standalone: true,
  selector: 'app-name-field',
  template: `
    <input
      [value]="name()"
      (input)="name.set($any($event.target).value)"
    />
  `,
})
export class NameFieldComponent {
  name = adapt('', baseStringAdapter);
}
```
