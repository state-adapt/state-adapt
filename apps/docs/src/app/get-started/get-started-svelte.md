## Tutorials

[Basic Syntax](/svelte#1-start-with-simple-state)

## Documentation

Svelte doesn't currently have a dedicated library from StateAdapt, but it will. For now, see [@state-adapt/rxjs](/docs/rxjs).

<!-- [@state-adapt/svelte](/docs/svelte) -->

## Setup

[StackBlitz demo](https://stackblitz.com/edit/vitejs-vite-szsd3d?file=src%2Fadapt.function.ts,src%2Flib%2FCounter.svelte&terminal=dev)

First, `npm install`:

```
npm i -s rxjs
npm i -s @state-adapt/{core,rxjs}
```

Configure StateAdapt in a file named `state-adapt.ts`:

```typescript
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

```tsx
import { adapt } from '../state-adapt';
const nameStore = adapt('name', '');
```

Svelte doesn't currently have a dedicated library from StateAdapt, but it will. For now, for more configuration options, see [@state-adapt/rxjs](/docs/rxjs).

<!-- For more configuration options, see [@state-adapt/svelte](/docs/svelte). -->

Go to [Tutorials](svelte/get-started#tutorials) for help on how to use StateAdapt after setup.
