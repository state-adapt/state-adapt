---
definedIn: https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/stores/join-stores.function.ts#L71
---

# Function: joinStores()

> **joinStores**\<`SE`\>(`storeEntries`): `NewBlockAdder`\<`{ [P in string]: EntriesState<SE>[P] }`, `JoinedSelectors`\<`SE`\>, `SE`\>

Defined in: [libs/rxjs/src/lib/stores/join-stores.function.ts:71](https://github.com/state-adapt/state-adapt/blob/main/libs/rxjs/src/lib/stores/join-stores.function.ts#L71)

`joinStores` is a function that takes in a `StoreEntries extends { [index: string]: StoreLike }` object and returns a `StoreBuilder` function.
The `StoreBuilder` function can be called again and again with more selector definitions, and finally with no arguments to create a store.

`joinStores` syntax is identical to that of [joinAdapters](../../core/src/joinAdapters.md) so that you can easily switch between the two.
The difference is that `joinStores` can only define selectors, while `joinAdapters` can define both selectors and reactions.

#### Example: Combining states from two stores

```typescript
import { joinStores } from '@state-adapt/rxjs';
import { adapt } from '../configure-state-adapt.ts';

const store1 = adapt(1);
const store2 = adapt(2);

const joinedStore = joinStores({ store1, store2 })();

joinedStore.state$.subscribe(console.log);
// { store1: 1, store2: 2 }
```

#### Example: Combining selectors from two stores

```typescript
import { createAdapter } from '@state-adapt/core';
import { joinStores } from '@state-adapt/rxjs';
import { adapt } from '../configure-state-adapt.ts';

const adapter = createAdapter<number>()({
  selectors: {
    double: s => s * 2,
  }
});

const store1 = adapt(1, adapter);
const store2 = adapt(2, adapter);

const joinedStore = joinStores({ store1, store2 })({
  sum: s => s.store1Double + s.store2Double,
})();

joinedStore.sum$.subscribe(console.log);
// 6
```

## Type Parameters

### SE

`SE` *extends* `StoreEntries`

## Parameters

### storeEntries

`SE`

## Returns

`NewBlockAdder`\<`{ [P in string]: EntriesState<SE>[P] }`, `JoinedSelectors`\<`SE`\>, `SE`\>
