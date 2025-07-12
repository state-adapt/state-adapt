---
definedIn: https://github.com/state-adapt/state-adapt/blob/4e457fa33331f265d75eaddb646761782498dd8e/libs/core/src/lib/adapters/join-adapters.function.ts#L221
---

# Function: joinAdapters()

> **joinAdapters**\<`ParentState`, `ExcludedProps`\>(): \<`AE`\>(`adapterEntries`) => `NewBlockAdder`\<`ParentState`, `FlattendAdapters`\<`AE`, `ParentState`\> *extends* `object` ? `S` *extends* `Selectors`\<`ParentState`\> ? `WithStateSelector`\<`ParentState`, `S`\<`S`\>\> : `WithStateSelector`\<`ParentState`, `Record`\<`string`, (`state`) => `any`\>\> : `object`, `ReactionsWithoutSelectors`\<`ParentState`, `FlattendAdapters`\<`AE`, `ParentState`\> & `BasicAdapterMethods`\<`ParentState`\> & `WithUpdateReaction`\<`ParentState`\>\>\>

Defined in: [src/lib/adapters/join-adapters.function.ts:221](https://github.com/state-adapt/state-adapt/blob/4e457fa33331f265d75eaddb646761782498dd8e/libs/core/src/lib/adapters/join-adapters.function.ts#L221)

joinAdapters creates a complex adapter from simpler adapters by taking each of their state change
functions and selectors and adding them to the new adapter with more specific names to distinguish them from
each other. All state reaction names have their adapter's namespaces inserted after the first word, and all selector names
get prepended with their adapter's namespace.

The initial joinAdapters call returns the same thing as the [buildAdapter](buildAdapter.md) call, so it can be called again and again with more objects inheriting from previous objects, until a final empty call `()` to get the final built adapter.

#### Example: Basic `joinAdapters`

```tsx
import { joinAdapters, createAdapter } from '@state-adapt/core';

interface State {
  a: number;
  b: number;
}

const adapter = joinAdapters<NumbersState>()({
  a: createAdapter<number>()({}),
  b: createAdapter<number>()({
    setTo0: state => 0,
    selectors: {
      negative: state => state * -1,
    },
  }),
})();
```

This is the same as:

```tsx
import { createAdapter } from '@state-adapt/core';

interface State {
  a: number;
  b: number;
}

const adapter = createAdapter<State>()({
  setA: (state, newA: number) => ({...state, a: newA}),
  resetA: (state, payload: void, initialState) => ({...state, a: initialState.a}),
  setBTo0: (state, payload: void) => ({...state, b: 0}),
  setB: (state, newB: number) => ({...state, b: newB}),
  resetB: (state, payload: void, initialState) => ({...state, b: initialState.b}),
  set: (state, newState: State) => newState,
  reset: (state, payload: void, initialState) => initialState,
  update: (state, newState: Partial<State>) => ({...state, ...newState}),
  selectors: {
    a: state => state.a,
    b: state => state.b,
    bNegative: state => state.b * -1,
    state: state => state,
  },
});
```

#### Example: `joinAdapters` with `buildAdapters`-like syntax

```tsx
import { joinAdapters, createAdapter } from '@state-adapt/core';
import { numberAdapter } from './number.adapter';

interface NumbersState {
  a: number;
  b: number;
}

const adapter = joinAdapters<NumbersState>()({
  a: numberAdapter,
  b: numberAdapter,
})({
  // Selectors
  total: s => s.a + s.b,
})({
  // Group reactions
  incrementAll: {
    a: numberAdapter.increment,
    b: numberAdapter.increment,
  },
})(([selectors, reactions]) => ({
  // More reactions
  addBToA: state => ({ ...state, a: state.a + selectors.b(state) }),
  addAToB: state => ({ ...state, b: state.b + selectors.a(state) }),
}))();
```

For more details, see [buildAdapter](buildAdapter.md).

#### Example: Auth

```tsx
import { joinAdapters, createAdapter } from '@state-adapt/core';

interface AuthState {
  username: string | null;
  password: string | null;
  isLoggedIn: boolean;
}

const authAdapter = joinAdapters<AuthState>()({
  username: createAdapter<string | null>()({}),
  password: createAdapter<string | null>()({}),
  isLoggedIn: createAdapter<boolean>()({
    login: () => true,
    logout: () => false,
  }),
})();

// Usage
const initialState = { username: null, password: null, isLoggedIn: false };
const newState = authAdapter.update(initialState, {
  username: 'bob',
  password: '1234',
});
// { username: 'bob', password '1234', isLoggedIn: false }
```

#### Example: Cookies

```tsx
import { joinAdapters, createAdapter } from '@state-adapt/core';

interface CookieState {
  price: number;
  flavor: 'Chocolate Chip' | 'Oatmeal Raisin';
}

const cookieAdapter = joinAdapters<CookieState>()({
  price: createAdapter<number>()({
    selectors: {
      discounted: state => state * 0.9,
    },
  }),
  flavor: createAdapter<Flavor>()({
    setToChocolateChip: () => 'Chocolate Chip',
    setToOatmealRaisin: () => 'Oatmeal Raisin',
  }),
})();

interface CookiesState {
  favorite: CookieState;
  leastFavorite: CookieState;
}
const initialCookiesState: CookiesState = {
  favorite: {
    price: 200,
    flavor: 'Chocolate Chip',
  },
  leastFavorite: {
    price: 190,
    flavor: 'Oatmeal Raisin',
  },
};

const cookiesAdapter = joinAdapters<CookiesState>()({
  favorite: cookieAdapter,
  leastFavorite: cookieAdapter,
})({
  totalPrice: s => s.favorite.price + s.leastFavorite.price,
})({
  totalPriceDiscounted: s => s.totalPrice * 0.9,
})();

// Usage
cookiesAdapter.setFavoriteToOatmealRaisin(initialCookiesState);
cookiesAdapter.setLeastFavoriteToOatmealRaisin(initialCookiesState);
const favoritePriceDiscounted =
  cookiesAdapter.selectors.favoritePriceDiscounted(initialCookiesState);
const totalPrice = cookiesAdapter.selectors.totalPrice(initialCookiesState);
const totalPriceDiscounted =
  cookiesAdapter.selectors.totalPriceDiscounted(initialCookiesState);
```

#### Example: Olympic Sports

```tsx
import { joinAdapters, createAdapter } from '@state-adapt/core';

interface SportState {
  name: string;
  isOlympic: boolean;
}

const sportAdapter = joinAdapters<SportState>()({
  name: createAdapter<string>()({
    setToSoccer: () => 'soccer',
    setToBasketball: () => 'basketball',
  }),
  isOlympic: createAdapter<boolean>()({
    setToTrue: () => true,
    setToFalse: () => false,
  }),
})({
  isOlympicAndSoccer: s => s.isOlympic && s.name === 'soccer',
  isOlympicAndBasketball: s => s.isOlympic && s.name === 'basketball',
})({
  setToOlympicSoccer: {
    name: () => 'soccer',
    isOlympic: () => true,
  },
})();
```

## Type Parameters

### ParentState

`ParentState` *extends* `Record`\<`string`, `any`\>

### ExcludedProps

`ExcludedProps` *extends* `string` = `""`

## Returns

> \<`AE`\>(`adapterEntries`): `NewBlockAdder`\<`ParentState`, `FlattendAdapters`\<`AE`, `ParentState`\> *extends* `object` ? `S` *extends* `Selectors`\<`ParentState`\> ? `WithStateSelector`\<`ParentState`, `S`\<`S`\>\> : `WithStateSelector`\<`ParentState`, `Record`\<`string`, (`state`) => `any`\>\> : `object`, `ReactionsWithoutSelectors`\<`ParentState`, `FlattendAdapters`\<`AE`, `ParentState`\> & `BasicAdapterMethods`\<`ParentState`\> & `WithUpdateReaction`\<`ParentState`\>\>\>

### Type Parameters

#### AE

`AE` *extends* `AdapterEntries`\<`Omit`\<`ParentState`, `ExcludedProps`\>\>

### Parameters

#### adapterEntries

`AE`

### Returns

`NewBlockAdder`\<`ParentState`, `FlattendAdapters`\<`AE`, `ParentState`\> *extends* `object` ? `S` *extends* `Selectors`\<`ParentState`\> ? `WithStateSelector`\<`ParentState`, `S`\<`S`\>\> : `WithStateSelector`\<`ParentState`, `Record`\<`string`, (`state`) => `any`\>\> : `object`, `ReactionsWithoutSelectors`\<`ParentState`, `FlattendAdapters`\<`AE`, `ParentState`\> & `BasicAdapterMethods`\<`ParentState`\> & `WithUpdateReaction`\<`ParentState`\>\>\>
