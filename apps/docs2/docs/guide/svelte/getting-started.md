---
next:
  text: 'API Reference'
  link: '/api/core/src/'
---

# Getting Started

Install the StateAdapt core and RxJS packages:

<!--@include-section: @state-adapt/core#Installation-->

<!--@include-section: @state-adapt/rxjs#Installation-->

## Create a StateAdapt instance

<!--@include-section: @state-adapt/rxjs#Standalone setup-->

Use the instance in your components:

```svelte
<script lang="ts">
  import { adapt } from '../state-adapt';

  const nameStore = adapt('Bob');
  const name$ = nameStore.state$;
</script>

<p>Hello {$name$}!</p>
```

::: info Library Coming Soon
StateAdapt doesn't currently have a dedicated library for Svelte, but it will.

### Runes

We are considering two options to add support for runes. Please [check progress here](https://github.com/state-adapt/state-adapt/issues/100) and chime in with feedback.

![Runes](https://i.ytimg.com/vi/RVnxF3j3N8U/maxresdefault.jpg)

:::

<!-- For more configuration options, see [@state-adapt/svelte](/docs/svelte). -->

[StackBlitz demo](https://stackblitz.com/edit/vitejs-vite-szsd3d?file=src%2Fadapt.function.ts,src%2Flib%2FCounter.svelte&terminal=dev)

<!--@include: ../../../includes/agents.md-->

## ESLint Plugin: No Spaghetti

<!--@include-section: @state-adapt/eslint-plugin-spaghetti#Getting Started-->
