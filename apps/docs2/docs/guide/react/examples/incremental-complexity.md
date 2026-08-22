# Incremental Complexity

## `useState` without regrets

Clean state management should be easy, like `useState`.

Developers should feel completely free to use `useState` for simple features, even if they might become more complex later.

## A smooth path to reducers

When state needs to change in more complex ways, there are 2 approaches:

> **Event handlers**—scattered state logic ❌

> **Reducers**—colocated state logic ✅

Reducers are great, but refactoring from `useState` to `useReducer` takes a lot of work.

StateAdapt provides a smoother path to reducers:

### 1. Replace `useState` with `useAdapt`

```tsx
function SimpleStateAdapt() {
  const [name, setName] = useState('Bob'); // [!code --]
  const [name, setName] = useAdapt('Bob'); // [!code ++]
  return (
    <>
      <h2>Hello {name}!</h2> // [!code --]
      <h2>Hello {name.state}!</h2> // [!code ++]
      <button onClick={() => setName('Bilbo')}>Change Name</button>
    </>
  );
}
```

Result:

```tsx
function SimpleStateAdapt() {
  const [name, setName] = useAdapt('Bob');
  return (
    <>
      <h2>Hello {name.state}!</h2>
      <button onClick={() => setName('Bilbo')}>Change Name</button>
    </>
  );
}
```

### 2. Add Reducers

```tsx
function ReducedState() {
  const [name, setName] = useAdapt('Bob'); // [!code --]
  // [!code ++ 1]
  const [name, setName] = useAdapt('Bob', {
    reverse: name => name.split('').reverse().join(''), // name type inferred // [!code ++]
  }); // [!code ++]
  return (
    <>
      <h2>Hello {name.state}!</h2>
      <button onClick={() => setName('Bilbo')}>Change Name</button>
      <button onClick={() => setName.reverse()}>Reverse Name</button> // [!code ++]
    </>
  );
}
```

Result:

```tsx
function ReducedState() {
  const [name, setName] = useAdapt('Bob', {
    reverse: name => name.split('').reverse().join(''),
  });
  return (
    <>
      <h2>Hello {name.state}!</h2>
      <button onClick={() => setName('Bilbo')}>Change Name</button>
      <button onClick={() => setName.reverse()}>Reverse Name</button>
    </>
  );
}
```

## A smooth path to shared state

Moving local state to shared state should be easy.

`useAdapt` easily splits into `adapt` and `useStore`:

```tsx
// [!code ++ 1]
const nameStore = adapt('Bob', {
  reverse: name => name.split('').reverse().join(''), // [!code ++]
}); // [!code ++]

function SharedState() {
  // [!code -- 1]
  const [name, setName] = useAdapt('Bob', {
    reverse: name => name.split('').reverse().join(''), // [!code --]
  }); // [!code --]
  const [name, setName] = useStore(nameStore); // [!code ++]
  return (
    <>
      <h2>Hello {name.state}!</h2>
      <button onClick={() => setName('Bilbo')}>Change Name</button>
      <button onClick={() => setName.reverse()}>Reverse Name</button>
    </>
  );
}
```

Result:

```tsx
const nameStore = adapt('Bob', {
  reverse: name => name.split('').reverse().join(''),
});

function SharedState() {
  const [name, setName] = useStore(nameStore);
  return (
    <>
      <h2>Hello {name.state}!</h2>
      <button onClick={() => setName('Bilbo')}>Change Name</button>
      <button onClick={() => setName.reverse()}>Reverse Name</button>
    </>
  );
}
```

<!-- <video controls loop>
  <source src="./assets/demo-1-simple-state.mov" type="video/mp4"/>
</video> -->

<!-- ### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F1SimpleState.tsx) -->

## A smooth path to shared, derived state

Nothing is as easy as derived state in React components:

```tsx
const [name, setName] = useAdapt(nameStore);

const randomCaseName = name.state // [!code highlight]
  .split('') // [!code highlight]
  .map(c => (Math.random() > 0.5 ? c : c.toUpperCase())) // [!code highlight]
  .join(''); // [!code highlight]

// ...
```

Since nothing can match this syntax, anything you do to share this logic with other components will require _some_ refactoring.

One way StateAdapt addresses this is by allowing selectors to be defined alongside state from the start:

```tsx
function SharedDerivedState() {
  const [name, setName] = useAdapt('Bob', {
    reverse: name => name.split('').reverse().join(''),
    // [!code ++ 1]
    seletors: {
      randomCase: (
        name, // [!code ++]
      ) =>
        name // [!code ++]
          .split('') // [!code ++]
          .map(c => (Math.random() > 0.5 ? c : c.toUpperCase())) // [!code ++]
          .join(''), // [!code ++]
    }, // [!code ++]
  });
  return (
    <>
      <h2>Hello {name.state}!</h2>
      <h2>Hello {name.randomCase}!</h2> // [!code ++]
      <button onClick={() => setName('Bilbo')}>Change Name</button>
      <button onClick={() => setName.reverse()}>Reverse Name</button>
    </>
  );
}
```

Now if you need to share it, the selectors can just move with the state:

```tsx
// [!code ++ 1]
const nameStore = adapt('Bob', {
  reverse: name => name.split('').reverse().join(''), // [!code ++]
  // [!code ++ 1]
  seletors: {
    randomCase: (
      name, // [!code ++]
    ) =>
      name // [!code ++]
        .split('') // [!code ++]
        .map(c => (Math.random() > 0.5 ? c : c.toUpperCase())) // [!code ++]
        .join(''), // [!code ++]
  }, // [!code ++]
}); // [!code ++]

function SharedDerivedState() {
  // [!code -- 1]
  const [name, setName] = useAdapt('Bob', {
    reverse: name => name.split('').reverse().join(''), // [!code --]
    // [!code -- 1]
    seletors: {
      randomCase: (
        name, // [!code --]
      ) =>
        name // [!code --]
          .split('') // [!code --]
          .map(c => (Math.random() > 0.5 ? c : c.toUpperCase())) // [!code --]
          .join(''), // [!code --]
    }, // [!code --]
  }); // [!code --]
  const [name, setName] = useStore(nameStore); // [!code ++]
  return (
    <>
      <h2>Hello {name.state}!</h2>
      <h2>Hello {name.randomCase}!</h2>
      <button onClick={() => setName('Bilbo')}>Change Name</button>
      <button onClick={() => setName.reverse()}>Reverse Name</button>
    </>
  );
}
```

Result:

```tsx
const nameStore = adapt('Bob', {
  reverse: name => name.split('').reverse().join(''),
  seletors: {
    randomCase: name =>
      name
        .split('')
        .map(c => (Math.random() > 0.5 ? c : c.toUpperCase()))
        .join(''),
  },
});

function SharedDerivedState() {
  const [name, setName] = useStore(nameStore);
  return (
    <>
      <h2>Hello {name.state}!</h2>
      <h2>Hello {name.randomCase}!</h2>
      <button onClick={() => setName('Bilbo')}>Change Name</button>
      <button onClick={() => setName.reverse()}>Reverse Name</button>
    </>
  );
}
```

<!--
But you will sometimes still need to refactor local derived state to shared derived state.

An AI tool like [Copilot](https://github.com/features/copilot) completely solves this for StateAdapt,
because selectors are a widely familiar state management pattern.
Copilot will see `doubleCount` below and suggest a correct completion

```tsx
const nameStore = adapt('Bob', {
  reverse: name => name.split('').reverse().join(''),
  seletors: {
    random 👈 // Trigger Copilot suggestion // [!code highlight]
    randomCase: name => // Autocompleted by Copilot, with no other context // [!code ++]
      name // [!code ++]
        .split('') // [!code ++]
        .map(c => (Math.random() > 0.5 ? c : c.toUpperCase())) // [!code ++]
        .join(''), // [!code ++]
  },
});

function SharedDerivedState() {
  const [name, setName] = useStore(nameStore);
  const randomCaseName = name.state // Now we can delete this down here // [!code --]
    .split('') // [!code --]
    .map(c => (Math.random() > 0.5 ? c : c.toUpperCase())) // [!code --]
    .join(''); // [!code --]
  return (
    <>
      <h2>Hello {name.state}!</h2>
      <h2>Hello {name.randomCase}!</h2>
      <button onClick={() => setName('Bilbo')}>Change Name</button>
      <button onClick={() => setName.reverse()}>Reverse Name</button>
    </>
  );
}
``` -->

<!-- The only way to share this logic with multiple components without refactoring is to create a custom hook. But this still takes work, because you need to return everything, and destructure it:

```tsx
// [!code ++ 1]
function useCountWithDouble(initialCount: 0) {
  const [count, setCount] = useAdapt(0);

  const doubleCount = count.state * 2;

  return [{ count, doubleCount }, setCount] as const; // [!code ++]
} // [!code ++]

// ...

  const [{ count, doubleCount }, setCount] = useCountWithDouble(0); // [!code ++]
```

Or you could try creating a hook for just `doubleCount`:

```tsx
// [!code ++ 1]
function useDoubleCount(count: { state: number }) {
  const doubleCount = count.state * 2;
  return doubleCount; // [!code ++]
} // [!code ++]

// ...
  const [count, setCount] = useAdapt(0);

  const doubleCount = useDoubleCount(count); // [!code ++]

``` -->
<!--
```tsx
const nameStore = adapt('Bob', {
  reverse: name => name.split('').reverse().join(''),
  // [!code ++ 1]
  selectors: {
    yelled: name => name.toUpperCase(), // Will be memoized // [!code ++]
  }, // [!code ++]
});

function DerivedState() {
  const [name, setName] = useStore(nameStore);
  return (
    < >
      <h2>Hello {name.state}!</h2>
      <h2>Hello {name.yelled}!</h2> // [!code ++]
      <button onClick={() => setName('Bilbo')}>Change Name</button>
      <button onClick={() => setName.reverse()}>Reverse Name</button>
    </>
  );
}
```

Result:

```tsx
const nameStore = adapt('Bob', {
  reverse: name => name.split('').reverse().join(''),
  selectors: {
    yelled: name => name.toUpperCase(), // Will be memoized
  },
});

function SharedDerivedState() {
  const [name, setName] = useStore(nameStore);
  return (
    <>
      <h2>Hello {name.state}!</h2>
      <h2>Hello {name.yelled}!</h2>
      <button onClick={() => setName('Bilbo')}>Change Name</button>
      <button onClick={() => setName.reverse()}>Reverse Name</button>
    </>
  );
}
```

<video controls loop>
  <source src="./assets/demo-2-derived-state.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F2DerivedState.tsx) -->

<!-- ## 3. Define state changes declaratively in stores

Maintain separation of concerns by keeping state logic together instead of scattered.

```tsx
 const nameStore = adapt('Bob', {
  reverse: name => name.split('').reverse().join(''), // [!code ++]
  selectors: {
    yelled: name => name.toUpperCase(), // Will be memoized
  },
});

function SharedState() {
  const [name] = useStore(nameStore);
  return (
    < >
      <h2>Hello {name.yelled}!</h2>
      <button onClick={() => setName('Bilbo')}>Change Name</button>
      <button onClick={() => setName.reverse()}>Reverse Name</button> // [!code ++]
    </>
  );
}
```

<video controls loop>
  <source src="./assets/demo-3-state-changes.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F3StateChanges.tsx) -->

## A smooth path to state logic reuse

### Decoupled

In most state management libraries, state logic is tied to specific instances of state. This can require major refactoring if multiple states end up needing the same logic.

State adapters provide a smooth path to extracting logic away from specific event sources and state:

```tsx
// [!code -- 1]
const nameStore = adapt('Bob', {
// [!code ++ 1]
const nameAdapter = createAdapter<string>()({
  reverse: name => name.split('').reverse().join(''),
  selectors: {
    randomCase: name =>
      name
        .split('')
        .map(c => (Math.random() > 0.5 ? c : c.toUpperCase()))
        .join(''),
  },
});
const name1Store = adapt('Bob', nameAdapter); // [!code ++]
const name2Store = adapt('Kat', nameAdapter); // [!code ++]

// ...
```

Result:

```tsx
const nameAdapter = createAdapter<string>()({
  reverse: name => name.split('').reverse().join(''),
  selectors: {
    randomCase: name =>
      name
        .split('')
        .map(c => (Math.random() > 0.5 ? c : c.toUpperCase()))
        .join(''),
  },
});
const name1Store = adapt('Bob', nameAdapter);
const name2Store = adapt('Kat', nameAdapter);

function StateAdapters() {
  const [name1, setName1] = useStore(name1Store);
  const [name2, setName2] = useStore(name2Store);
  return (
    <>
      <h2>Hello {name1.state}!</h2>
      <h2>Hello {name1.randomCase}!</h2>
      <button onClick={() => setName1('Bilbo')}>Change Name</button>
      <button onClick={() => setName1.reverse()}>Reverse Name</button>

      <h2>Hello {name2.state}!</h2>
      <h2>Hello {name2.randomCase}!</h2>
      <button onClick={() => setName2('Bilbo')}>Change Name</button>
      <button onClick={() => setName2.reverse()}>Reverse Name</button>
    </>
  );
}
```

### Composable

State adapters provide a smooth path to adapting to changes in state shape. If you start with a simple boolean adapter, for example:

```ts
const booleanAdapter = createAdapter<boolean>()({
  toggle: state => !state,
});
```

And later decide to have multiple boolean properties of a larger state object:

```ts
type State = {
  isActive: boolean;
  isVisible: boolean;
};
```

You can reuse the simple boolean logic by creating a [joined adapter](/api/core/src/joinAdapters.html) that extends it:

```ts
const adapter = joinAdapters<State>()({
  isActive: booleanAdapter,
  isVisible: booleanAdapter,
})();
```

This creates reducers in `adapter` called `toggleIsActive` and `toggleIsVisible` that toggle the respective properties.

StateAdapt exports some adapters for some common types. Check out the adapters you can import from [@state-adapt/core/adapters](/api/core/adapters/).

<!-- <video controls loop>
  <source src="./assets/demo-4-state-adapters.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F4StateAdapters.tsx) -->

## A smooth path to reactive state

When multiple states need to change after an event, there are 2 approaches:

> **Event handlers updating multiple states**—scattered state changes ❌

> **States reacting to events**—colocated state changes ✅

Reactive state is great, but it takes a lot of work to refactor to a state management library that supports event-driven state, like Redux.

StateAdapt provides a smooth path to reactive state:

```tsx
// ...

const onResetAll = source(); // Shared event source // [!code ++]

const name1Store = adapt('Bob', nameAdapter); // [!code --]
// [!code ++ 1]
const name1Store = adapt('Bob', {
  adapter: nameAdapter, // [!code ++]
  sources: { reset: onResetAll }, // calls `reset` reducer (included) // [!code ++]
}); // [!code ++]
const name2Store = adapt('Kat', nameAdapter); // [!code --]
// [!code ++ 1]
const name2Store = adapt('Kat', {
  adapter: nameAdapter, // [!code ++]
  sources: { reset: onResetAll }, // calls `reset` reducer (included) // [!code ++]
}); // [!code ++]

// ...

      <button onClick={onResetAll}>Reset All</button> // [!code ++]
    </>
  );
}
```

Result:

```tsx
const nameAdapter = createAdapter<string>()({
  reverse: name => name.split('').reverse().join(''),
  selectors: {
    randomCase: name =>
      name
        .split('')
        .map(c => (Math.random() > 0.5 ? c : c.toUpperCase()))
        .join(''),
  },
});

const onResetAll = source();

const name1Store = adapt('Bob', {
  adapter: nameAdapter,
  sources: { reset: onResetAll },
});
const name2Store = adapt('Kat', {
  adapter: nameAdapter,
  sources: { reset: onResetAll },
});

function ReactiveState() {
  const [name1, setName1] = useStore(name1Store);
  const [name2, setName2] = useStore(name2Store);
  return (
    <>
      <h2>Hello {name1.state}!</h2>
      <h2>Hello {name1.randomCase}!</h2>
      <button onClick={() => setName1('Bilbo')}>Change Name</button>
      <button onClick={() => setName1.reverse()}>Reverse Name</button>

      <h2>Hello {name2.state}!</h2>
      <h2>Hello {name2.randomCase}!</h2>
      <button onClick={() => setName2('Bilbo')}>Change Name</button>
      <button onClick={() => setName2.reverse()}>Reverse Name</button>

      <button onClick={onResetAll}>Reset All</button>
    </>
  );
}
```

<!-- <video controls loop>
  <source src="./assets/demo-5-observable-sources.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F5ObservableSources.tsx) -->

## A smooth path to multi-store, shared, derived states

State derived from multiple stores can [glitch and over-compute](https://dev.to/mfp22/signals-make-angular-much-easier-3k9) in some libraries, especially if RxJS-based.

But StateAdapt's `derive` is glitch-free and efficient, preventing the need for
complicated workarounds. Use derivations in components with `useDerived`:

```tsx
// ...

// [!code ++ 1]
const deriveBobcat = derive( // [!code ++]
  () => name1Store() === 'Bob' && name2Store() === 'Kat', // [!code ++]
); // [!code ++]

// ...

  const bobcat = useDerived(deriveBobcat); // [!code ++]

  // ...

      {bobcat && <h2>Hello, bobcat!</h2>} // [!code ++]
    </>
  );
}
```

Prefixing the derivation with `derive` leaves the plain name free for the value
inside the component.

Result:

```tsx
const nameAdapter = createAdapter<string>()({
  reverse: name => name.split('').reverse().join(''),
  selectors: {
    randomCase: name =>
      name
        .split('')
        .map(c => (Math.random() > 0.5 ? c : c.toUpperCase()))
        .join(''),
  },
});

const onResetAll = source();

const name1Store = adapt('Bob', {
  adapter: nameAdapter,
  sources: { reset: onResetAll },
});
const name2Store = adapt('Kat', {
  adapter: nameAdapter,
  sources: { reset: onResetAll },
});

const deriveBobcat = derive(
  () => name1Store() === 'Bob' && name2Store() === 'Kat',
);

function MultiStoreSharedDerivedState() {
  const [name1, setName1] = useStore(name1Store);
  const [name2, setName2] = useStore(name2Store);
  const bobcat = useDerived(deriveBobcat);
  return (
    <>
      <h2>Hello {name1.state}!</h2>
      <h2>Hello {name1.randomCase}!</h2>
      <button onClick={() => setName1('Bilbo')}>Change Name</button>
      <button onClick={() => setName1.reverse()}>Reverse Name</button>

      <h2>Hello {name2.state}!</h2>
      <h2>Hello {name2.randomCase}!</h2>
      <button onClick={() => setName2('Bilbo')}>Change Name</button>
      <button onClick={() => setName2.reverse()}>Reverse Name</button>

      <button onClick={onResetAll}>Reset All</button>

      {bobcat && <h2>Hello, bobcat!</h2>}
    </>
  );
}
```

<!-- ```tsx
 const nameAdapter = createAdapter<string>()({
  reverse: name => name.split('').reverse().join(''),
  concatName: (name, anotherName: string) => `${name} ${anotherName}`,
  selectors: {
    yelled: name => name.toUpperCase(), // Will be memoized
  },
});

const onNameFromServer = timer(3000).pipe(
  mapTo('Joel'),
  toSource('[name] onNameFromServer'), // Annotate for Redux Devtools
);

const onResetBoth = source('[name] onResetBoth'); // Annotate for Redux Devtools // [!code ++]

const name1Store = adapt('Bob', {
  adapter: nameAdapter,
   sources: onNameFromServer, // Set state // [!code --]
   // [!code ++ 1]
   sources: {
     set: onNameFromServer, // `set` is provided with all adapters // [!code ++]
     reset: onResetBoth, // `reset` is provided with all adapters // [!code ++]
   }, // [!code ++]
});
const name2Store = adapt('Bob', {
  adapter: nameAdapter,
   sources: {
     concatName: onNameFromServer, // Trigger a specific state reaction
     reset: onResetBoth, // `reset` is provided with all adapters // [!code ++]
   },
});

function SharedSources() {
  const [name1] = useStore(name1Store);
  const [name2] = useStore(name2Store);
  return (
    <>
      <h2>Hello {name1.yelled}!</h2>
      <button onClick={() => name1Store.set('Bilbo')}>Change Name</button>
      <button onClick={() => name1Store.reverse()}>Reverse Name</button>

      <h1>Hello { name2.yelled }!</h1>
      <button onClick={() => name2Store.set('Bilbo')}>Change Name</button>
      <button onClick={() => name2Store.reverse()}>Reverse Name</button>

      <button onClick={onResetBoth}>Reset Both</button> // [!code ++]
    </>
  );
}
``` -->

<!-- <video controls loop>
  <source src="./assets/demo-6-dom-sources.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F6DomSources.tsx) -->

## A smooth path to derived events

RxJS is the only way to smoothly scale to complex event-driven features.

StateAdapt sources extend RxJS observables, and StateAdapt stores directly reference RxJS observables and react to them:

```tsx
// ...

// [!code -- 1]
const name1Store = adapt('Bob', {
// [!code ++ 1]
const name1Store = adapt('Loading...', {
  adapter: nameAdapter,
  sources: { reset: onResetAll }, // [!code --]
  // [!code ++ 1]
  sources: {
    set: of('Bob').pipe(delay(3000)), // Any observable // [!code ++]
    reset: onResetAll, // [!code ++]
  }, // [!code ++]
});
// [!code -- 1]
const name2Store = adapt('Kat', {
// [!code ++ 1]
const name2Store = adapt('Loading...', {
  adapter: nameAdapter,
  sources: { reset: onResetAll }, // [!code --]
  // [!code ++ 1]
  sources: {
    set: of('Kat').pipe(delay(3000)), // Any observable // [!code ++]
    reset: onResetAll, // [!code ++]
  }, // [!code ++]
});

// ...

```

Result:

```tsx
const nameAdapter = createAdapter<string>()({
  reverse: name => name.split('').reverse().join(''),
  selectors: {
    randomCase: name =>
      name
        .split('')
        .map(c => (Math.random() > 0.5 ? c : c.toUpperCase()))
        .join(''),
  },
});

const onResetAll = source();

const name1Store = adapt('Loading...', {
  adapter: nameAdapter,
  sources: {
    set: of('Bob').pipe(delay(3000)),
    reset: onResetAll,
  },
});
const name2Store = adapt('Loading...', {
  adapter: nameAdapter,
  sources: {
    set: of('Kat').pipe(delay(3000)),
    reset: onResetAll,
  },
});

const deriveBobcat = derive(
  () => name1Store() === 'Bob' && name2Store() === 'Kat',
);

function DerivedEvents() {
  const [name1, setName1] = useStore(name1Store);
  const [name2, setName2] = useStore(name2Store);
  const bobcat = useDerived(deriveBobcat);
  return (
    <>
      <h2>Hello {name1.state}!</h2>
      <h2>Hello {name1.randomCase}!</h2>
      <button onClick={() => setName1('Bilbo')}>Change Name</button>
      <button onClick={() => setName1.reverse()}>Reverse Name</button>

      <h2>Hello {name2.state}!</h2>
      <h2>Hello {name2.randomCase}!</h2>
      <button onClick={() => setName2('Bilbo')}>Change Name</button>
      <button onClick={() => setName2.reverse()}>Reverse Name</button>

      <button onClick={onResetAll}>Reset All</button>

      {bobcat && <h2>Hello, bobcat!</h2>}
    </>
  );
}
```

<!-- const [onResetAllSuccess, onResetAllError] = partition(
  onResetAllResponse,
  res => 'error' in res,
); -->

## Automatic State Lifecycle and Unsubscriptions

For state to be fully reactive, it cannot rely on any external control code, including initialization and cleanup code.

StateAdapt stores know when they are being used, and automatically initialize and cleanup their state.

So, for this store:

```tsx
const name1Store = adapt('Loading...', {
  sources: of('Bob').pipe(delay(3000)),
});
```

When this component mounts:

```tsx
function AutomaticStateLifecycle() {
  const [name1, setName1] = useStore(name1Store);
  // ...
```

Only then will the state be initialized with `Loading...` and the observable created by `of('Bob').pipe(delay(3000))` receive a subscription.
After 3 seconds, the name will change to `'Bob'`.

Then, when `AutomaticStateLifecycle` unmounts, as long as no other components are using `name1Store`, the state will be cleared.

Then, when `AutomaticStateLifecycle` mounts again, the state will be re-initialized to `'Loading...'`,
the observable created with `of('Bob').pipe(delay(3000))` will be subscribed to again,
and after 3 seconds the name will change to `'Bob'` again.

In situations where you want to keep the store permanently active, you can manually subscribe to its `state$`:

```tsx
const name1Store = adapt('Loading...', {
  sources: of('Bob').pipe(delay(3000)),
});
name1Store.state$.subscribe(); // [!code ++]
```
