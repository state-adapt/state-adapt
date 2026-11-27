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

```tsx
import { from } from 'solid-js';
import { adapt } from '../state-adapt';

function Name() {
  const nameStore = adapt('Bob');
  const name = from(nameStore.state$);
  return <p>Hello {name()}!</p>;
}
```

Solid's `from` function subscribes immediately, so it's good to use only in components.

::: info Library Coming Soon
StateAdapt doesn't currently have a dedicated library for Solid.
:::

[StackBlitz demo](https://stackblitz.com/edit/solidjs-templates-oc7ivf?file=src%2Fadapt.function.ts)

<!--@include: ../../../includes/agents.md-->

## ESLint Plugin: No Spaghetti

<!--@include-section: @state-adapt/eslint-plugin-spaghetti#Getting Started-->
