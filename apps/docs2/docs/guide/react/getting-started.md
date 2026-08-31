---
next:
  text: 'API Reference'
  link: '/api/core/src/'
---

# Getting Started

First, install:

```sh
npm i -s rxjs
npm i -s @state-adapt/core
npm i -s @state-adapt/rxjs
npm i -s @state-adapt/react
npx skills experimental_sync # Optional (for coding agents)
```

Then create stores and use them in components:

```tsx
import { adapt, useAdapt, useStore } from '@state-adapt/react';

const countStore = adapt(5);

export function HelloWorld() {
  const [name, setName] = useAdapt('Bob');
  const [count, setCount] = useStore(countStore);
  // ...
}
```

### Advanced Configuration

To customize StateAdapt, use the React package's
[`createStateAdapt`](/api/react/index/createStateAdapt).

[StackBlitz Starter](https://stackblitz.com/edit/vitejs-vite-qcthao?file=src%2Fmain.tsx,src%2FCounter.tsx&terminal=dev)

<!--@include: ../../../includes/spaghetti-eslint.md-->
