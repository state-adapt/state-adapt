First, install:

```sh
npm i -s rxjs
npm i -s @state-adapt/core
npm i -s @state-adapt/rxjs
```

Create a file named `state-adapt.ts` and export `watch` and `adapt`:

```ts
import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
import { configureStateAdapt } from '@state-adapt/rxjs';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer,
});

export const { adapt, watch } = configureStateAdapt({
  devtools: enableReduxDevTools,
});
```

And now you can use it in your components:

```ts
import { adapt } from '../state-adapt';

const nameStore = adapt('Bob');
const name$ = nameStore.state$;
const name = $name$;
```

::: info Library Coming Soon
StateAdapt doesn't currently have a dedicated library for Svelte, but it will.

For now, for more configuration options, see [@state-adapt/rxjs](/docs/rxjs).

### Runes

We are considering two options to add support for runes. Please [check progress here](https://github.com/state-adapt/state-adapt/issues/100) and chime in with feedback.

![Runes](https://i.ytimg.com/vi/RVnxF3j3N8U/maxresdefault.jpg)

:::

<!-- For more configuration options, see [@state-adapt/svelte](/docs/svelte). -->

[StackBlitz demo](https://stackblitz.com/edit/vitejs-vite-szsd3d?file=src%2Fadapt.function.ts,src%2Flib%2FCounter.svelte&terminal=dev)
