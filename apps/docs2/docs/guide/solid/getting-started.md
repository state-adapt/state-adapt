---
next:
  text: 'API Reference'
  link: '/api/core/src/'
---

# Getting Started

<!--@include-section: @state-adapt/rxjs#Getting Started-->

And now you can use it in your components:

```tsx
import { from } from 'solid-js';
import { adapt } from '../state-adapt.function';

function Name() {
  const nameStore = adapt('Bob');
  const name = from(nameStore.state$);
  // ...
}
```

Solid's `from` function subscribes immediately, so it's good to use only in components.

::: info Library Coming Soon
StateAdapt doesn't currently have a dedicated library for Solid.

For now, refer to [`configureStateAdapt`](/api/rxjs/index/configureStateAdapt) for options.
:::

[StackBlitz demo](https://stackblitz.com/edit/solidjs-templates-oc7ivf?file=src%2Fadapt.function.ts)

<!--@include: ../../../includes/agents.md-->

## ESLint Plugin: No Spaghetti

<!--@include-section: @state-adapt/eslint-plugin-spaghetti-->

<!--@include-section: @state-adapt/eslint-plugin-spaghetti#Getting Started-->
