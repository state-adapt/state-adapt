StateAdapt syntax is minimal, speeding up experimentation and learning.

If you wanted to play with an idea for a counter, this is the code you'd write with a few state management libraries:

::: code-group

```tsx [StateAdapt 3]
import { numberAdapter } from '@state-adapt/core/adapters';
import { useAdapt } from '@state-adapt/react';

const Component = () => {
  const [count, setCount] = useAdapt(0, numberAdapter);
  // ... setCount.add(1)
};
```

```tsx [React]
import { useState } from 'react';

const Component = () => {
  const [count, setCount] = useState(0);
  const increment = (qty: number) => setCount(c => c + qty);
  const decrement = (qty: number) => setCount(c => c - qty);
  // ...
};
```

```tsx [Zustand]
import { create } from 'zustand';

type State = {
  count: number;
};

type Actions = {
  increment: (qty: number) => void;
  decrement: (qty: number) => void;
};

const useCountStore = create<State & Actions>(set => ({
  count: 0,
  increment: (qty: number) => set(state => ({ count: state.count + qty })),
  decrement: (qty: number) => set(state => ({ count: state.count - qty })),
}));

const Component = () => {
  const count = useCountStore(state => state.count);
  const increment = useCountStore(state => state.increment);
  const decrement = useCountStore(state => state.decrement);
  // ...
};
```

```tsx [Redux RTK]
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';

const countSlice = createSlice({
  name: 'count',
  initialState: { count: 0 },
  reducers: {
    incremented: (state, qty: number) => {
      state.count += qty;
    },
    decremented: (state, qty: number) => {
      state.count -= qty;
    },
  },
});

const countStore = configureStore({ reducer: countSlice.reducer });

const Component = () => {
  const count = useSelector(state => state.count);
  const dispatch = useDispatch();
  const increment = (qty: number) => dispatch(countSlice.actions.incremented(qty));
  const decrement = (qty: number) => dispatch(countSlice.actions.decremented(qty));
  // ...
};
```

```tsx [StateAdapt 4?]
import { useAdapt } from '@state-adapt/react';

const Component = () => {
  const [count, setCount] = useAdapt(0);
  // ...
};
```

:::

This isn't cheating because a key benefit of state adapters is that they are composable, which enables reuse of `numberAdapter`.

It's not cheating with the state shape either, because most state management libraries _require_ containing objects, but **there is no reason to use one until it's needed.**

You can even add a second counter the same way and nobody will care:

```tsx
import { numberAdapter } from '@state-adapt/core/adapters';
import { useAdapt } from '@state-adapt/react';

const Component = () => {
  const [count1, setCount1] = useAdapt(0, numberAdapter);
  const [count2, setCount2] = useAdapt(0, numberAdapter);
  // ...
};
```

But you could also create a parent state if you wanted to, and here is how they compare there:

::: code-group

```tsx [StateAdapt 3]
import { numberAdapter } from '@state-adapt/core/adapters';
import { useAdapt } from '@state-adapt/react';

type State = {
  count1: number;
  count2: number;
};

const initialState: State = {
  count1: 0,
  count2: 0,
};

const adapter = joinAdapters<State>()({
  count1: numberAdapter,
  count2: numberAdapter,
})();

const Component = () => {
  const [counts, setCounts] = useAdapt(initialState, adapter);
  // ... setCounts.addCount1(1)
};
```

```tsx [React]
import { useState } from 'react';

const Component = () => {
  const [counts, setCounts] = useState({
    count1: 0,
    count2: 0,
  });

  const increment = (qty: number, id: number) => {
    const key = 'count' + id;
    setCounts(state => ({ ...state, [key]: state[key] + qty }));
  };
  const decrement = (qty: number, id: number) => {
    const key = 'count' + id;
    setCounts(state => ({ ...state, [key]: state[key] - qty }));
  };
  // ...
};
```

```tsx [Zustand]
import { create } from 'zustand';

type State = {
  count1: number;
  count2: number;
};

type Actions = {
  increment: (qty: number, id: number) => void;
  decrement: (qty: number, id: number) => void;
};

const useCountStore = create<State & Actions>(set => ({
  count: 0,
  increment: (qty: number, id: number) =>
    set(state => {
      const key = 'count' + id;
      return { [key]: state[key] + qty };
    }),
  decrement: (qty: number, id: number) =>
    set(state => {
      const key = 'count' + id;
      return { [key]: state[key] - qty };
    }),
}));

const Component = () => {
  const count1 = useCountStore(state => state.count1);
  const count2 = useCountStore(state => state.count2);
  const increment = useCountStore(state => state.increment);
  const decrement = useCountStore(state => state.decrement);
  // ...
};
```

```tsx [Redux RTK]
import { createSlice, configureStore } from '@reduxjs/toolkit';

const countSlice = createSlice({
  name: 'counts',
  initialState: {
    count1: 0,
    count2: 0,
  },
  reducers: {
    incremented: (state, action) => {
      const { qty, id } = action.payload;
      state['count' + id] += qty;
    },
    decremented: (state, action) => {
      const { qty, id } = action.payload;
      state['count' + id] -= qty;
    },
  },
});

const countStore = configureStore({ reducer: countSlice.reducer });
```

```tsx [StateAdapt 4?]
import { useAdapt } from '@state-adapt/react';

const Component = () => {
  const [counts, setCounts] = useAdapt({
    count1: 0,
    count2: 0,
  });
  // ...
};
```

:::

A lot closer, but some repetition will be addressed in StateAdapt 4.
