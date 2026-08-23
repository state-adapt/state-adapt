---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/create-state-adapt.function.ts#L105
---

# Function: createStateAdapt()

> **createStateAdapt**(`options?`): `object`

Defined in: [lib/create-state-adapt.function.ts:105](https://github.com/state-adapt/state-adapt/blob/main/libs/react/src/lib/create-state-adapt.function.ts#L105)

Creates a StateAdapt instance with the provided configuration. See
[ConfigureStateAdaptOptions](../../rxjs/index/ConfigureStateAdaptOptions.md) for every available option.

Define the configuration in one module and export its [adapt](adapt.md) and
[watch](watch.md) functions from there. This example disables Redux DevTools:

```ts
// state-adapt.ts
import { createStateAdapt } from '@state-adapt/react';

export const stateAdapt = createStateAdapt({ devtools: null });
export const { adapt, watch } = stateAdapt;
```

Import the store functions from that module wherever you create stores:

```ts
// counter.store.ts
import { adapt } from './state-adapt';

export const countStore = adapt(5);
```

Provide the same instance to the React hooks at the root of your app through
[AdaptContext](AdaptContext.md):

```tsx
// main.tsx
import { AdaptContext } from '@state-adapt/react';
import { createRoot } from 'react-dom/client';

import { App } from './app';
import { stateAdapt } from './state-adapt';

const root = createRoot(document.getElementById('root')!);

root.render(
  <AdaptContext.Provider value={stateAdapt}>
    <App />
  </AdaptContext.Provider>,
);
```

#### Keep custom configuration imports consistent

The package-level `adapt` and `watch` always use the default configuration
([defaultStateAdapt](defaultStateAdapt.md)). With a custom configuration, import them from
your application's `state-adapt.ts` module and provide that same
`stateAdapt` through [AdaptContext](AdaptContext.md). Only combine stores created by
the same instance.

StateAdapt stops unsafe combinations with these errors:

```text
StateAdapt Error: This store was created by a different StateAdapt instance
than the one provided to React through AdaptContext. Make sure the store and
React use the same StateAdapt instance. If you created an instance with
createStateAdapt, provide that instance through AdaptContext and import adapt
and watch from the module where you called createStateAdapt instead of
@state-adapt/react.
```

```text
StateAdapt Error: derive cannot combine stores created by different
StateAdapt instances.
```

```text
StateAdapt Error: joinStores cannot combine stores created by different
StateAdapt instances.
```

To help ensure that `adapt`, `watch`, and `defaultStateAdapt` are imported
from the correct place, custom-configured applications can add this ESLint
rule:

```js
// eslint.config.js
{
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@state-adapt/react',
            importNames: ['adapt', 'watch', 'defaultStateAdapt'],
            message:
              'Import this from your application state-adapt.ts module when using custom StateAdapt configuration.',
          },
        ],
      },
    ],
  },
}
```

## Parameters

### options?

[`ConfigureStateAdaptOptions`](../../rxjs/index/ConfigureStateAdaptOptions.md)

## Returns

### adapt()

> **adapt**: \<`State`, `S`, `R`, `R2`, `ReturnedSources`\>(`initialState`, `second?`) => `ReactStore`\<`State`, `S`, `object` *extends* `R` ? `R2` : `R`\>

Creates a store using this StateAdapt instance.

#### Type Parameters

##### State

`State`

##### S

`S` *extends* `Selectors`\<`State`\>

##### R

`R` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

##### R2

`R2` *extends* `ReactionsWithSelectors`\<`State`, `S`\>

##### ReturnedSources

`ReturnedSources` = `unknown`

#### Parameters

##### initialState

`InitialState`\<`State`\>

##### second?

`R` & `object` & `NotAdaptOptions` | `AdaptOptions`\<`State`, `S`, `R2`, `ReturnedSources`\>

#### Returns

`ReactStore`\<`State`, `S`, `object` *extends* `R` ? `R2` : `R`\>

### watch()

> **watch**: \<`State`, `S`, `R`\>(`path`, `adapter?`) => `ReactWatch`\<`State`, `S`\>

Watches a store path using this StateAdapt instance.

#### Type Parameters

##### State

`State` = `any`

##### S

`S` *extends* `Selectors`\<`State`\> = \{ \}

##### R

`R` *extends* `ReactionsWithSelectors`\<`State`, `S`\> = \{ \}

#### Parameters

##### path

`string`

##### adapter?

[`Adapter`](../../core/src/Adapter.md)\<`State`, `S`, `R` & `BasicAdapterMethods`\<`State`\>\>

#### Returns

`ReactWatch`\<`State`, `S`\>
