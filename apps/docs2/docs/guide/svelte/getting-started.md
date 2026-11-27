---
next:
  text: 'API Reference'
  link: '/api/core/src/'
---

# Getting Started

<!--@include-section: @state-adapt/rxjs#Getting Started-->

And now you can use it in your components:

```ts
import { adapt } from '../state-adapt';

const nameStore = adapt('Bob');
const name$ = nameStore.state$;
const name = $name$;
```

::: info Library Coming Soon
StateAdapt doesn't currently have a dedicated library for Svelte, but it will.

For now, refer to [`configureStateAdapt`](/api/rxjs/index/configureStateAdapt) for options.

### Runes

We are considering two options to add support for runes. Please [check progress here](https://github.com/state-adapt/state-adapt/issues/100) and chime in with feedback.

![Runes](https://i.ytimg.com/vi/RVnxF3j3N8U/maxresdefault.jpg)

:::

<!-- For more configuration options, see [@state-adapt/svelte](/docs/svelte). -->

[StackBlitz demo](https://stackblitz.com/edit/vitejs-vite-szsd3d?file=src%2Fadapt.function.ts,src%2Flib%2FCounter.svelte&terminal=dev)

<!--@include: ../../../includes/agents.md-->

## ESLint Plugin: No Spaghetti

<!--@include-section: @state-adapt/eslint-plugin-spaghetti-->

<!--@include-section: @state-adapt/eslint-plugin-spaghetti#Getting Started-->
