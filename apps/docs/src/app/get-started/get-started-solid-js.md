## Tutorials

[Basic Syntax](/solid-js#1-start-with-simple-state)

## Documentation

SolidJS doesn't currently have a dedicated library from StateAdapt, but it will. For now, see [@state-adapt/rxjs](/docs/rxjs).

<!-- [@state-adapt/solid-js](/docs/solid-js) -->

## Setup

[StackBlitz demo](https://stackblitz.com/edit/solidjs-templates-oc7ivf?file=src%2Fadapt.function.ts)

First, `npm install`:

```
npm i -s rxjs
npm i -s @state-adapt/{core,rxjs}
```

Configure StateAdapt in a file named `state-adapt.ts`:

```typescript
// state-adapt.ts
import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
import { configureStateAdapt, StateAdapt } from '@state-adapt/rxjs';

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
import { adapt } from '../state-adapt.function';
const stringStore = adapt('string', '');
```

Additionally, you can create this helper function to get objects with only signals from stores:

```typescript
// from-adapt.function.ts
import { SmartStore } from '@state-adapt/rxjs';
import { Observable } from 'rxjs';
import { Accessor, from } from 'solid-js';

type StoreSignals<Store extends SmartStore<any, any>> = {
  [K in keyof Store as K extends `${infer SelectorName}$`
    ? SelectorName
    : never]: Accessor<Store[K] extends Observable<infer T> ? T : never>;
};

export function fromAdapt<Store extends SmartStore<any, any>>(
  store: Store,
): StoreSignals<Store> {
  const signals = {} as any;
  for (const prop in store) {
    const lenWithoutLast = prop.length - 1;
    if (prop.charAt(lenWithoutLast) !== '$') continue;
    const selectorName = prop.slice(0, lenWithoutLast);
    signals[selectorName] = from((store as any)[prop]);
  }
  return signals;
}
```

SolidJS' `from` function immediately subscribes to observables, so it's good to use it in components. You can use it like this:

```tsx
import { adapt } from '../adapt.function';
import { fromAdapt } from '../from-adapt.function';

const nameStore = adapt('name', '');

export function Counter() {
  const name = fromAdapt(nameStore);
  return (
    <div>
      <h1>{name.state()}</h1>
      <button onClick={() => nameStore.set('new name')}>Set name</button>
    </div>
  );
}
```

SolidJS doesn't currently have a dedicated library from StateAdapt, but it will. For now, for more configuration options, see [@state-adapt/rxjs](/docs/rxjs).

<!-- For more configuration options, see [@state-adapt/solid-js](/docs/solid-js). -->

Go to [Tutorials](solid-js/get-started#tutorials) for help on how to use StateAdapt after setup.
