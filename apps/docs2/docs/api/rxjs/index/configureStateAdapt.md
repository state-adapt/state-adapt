# Function: configureStateAdapt()

> **configureStateAdapt**\<`Store`\>(`options`): `Pick`\<[`StateAdapt`](StateAdapt.md)\<`any`\>, `"adapt"` \| `"watch"`\>

Defined in: [libs/rxjs/src/lib/global-store/configure-state-adapt.function.ts:69](https://github.com/state-adapt/state-adapt/blob/4ff8540684d6d76a52452612f8fa44ffd7c6016a/libs/rxjs/src/lib/global-store/configure-state-adapt.function.ts#L69)

`configureStateAdapt` takes in a [ConfigureStateAdaptOptions](ConfigureStateAdaptOptions.md) object and returns a new instance of [StateAdapt](StateAdapt.md).

### Example: Standalone with default options

```ts
import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
import { configureStateAdapt } from '@state-adapt/rxjs';

export const stateAdapt = configureStateAdapt();

export const { adapt, watch } = stateAdapt;
```

### Example: Standalone

```ts
import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
import { configureStateAdapt } from '@state-adapt/rxjs';

export const stateAdapt = configureStateAdapt({
  devtools: (window as any)?.__REDUX_DEVTOOLS_EXTENSION__?.({
    actionSanitizer,
    stateSanitizer,
  }),
  showSelectors: false,
});

export const { adapt, watch } = stateAdapt;
```

### Example: With another store

```ts
import { configureStore } from '@reduxjs/toolkit'; // or any other Redux-like store
import { configureStateAdapt } from '@state-adapt/rxjs';
import { reducer } from './reducer';

const store = configureStore({ reducer });

export const stateAdapt = configureStateAdapt({ store });

export const { adapt, watch } = stateAdapt;
```

## Type Parameters

### Store

`Store` *extends* `GlobalStore`\<`any`, `any`\> = `GlobalStore`\<`any`, `any`\>

## Parameters

### options

[`ConfigureStateAdaptOptions`](ConfigureStateAdaptOptions.md)\<`Store`\> = `...`

## Returns

`Pick`\<[`StateAdapt`](StateAdapt.md)\<`any`\>, `"adapt"` \| `"watch"`\>
