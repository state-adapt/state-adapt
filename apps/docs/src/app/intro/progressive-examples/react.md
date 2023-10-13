## 1. Start simple

StateAdapt stores start almost as simple as `useState`, but with Redux Devtools support!

### Local State

```tsx
function SimpleState() {
  const [name, nameStore] = useAdapt('Bob');
  return (
    <>
      <h2>Hello {name.state}!</h2>
      <button onClick={() => nameStore.set('Bilbo')}>Change Name</button>
    </>
  );
}
```

### Shared State

```tsx
const nameStore = adapt('Bob');

function SimpleState() {
  const name = useStore(nameStore);
  return (
    <>
      <h2>Hello {name.state}!</h2>
      <button onClick={() => nameStore.set('Bilbo')}>Change Name</button>
    </>
  );
}
```

<video controls loop>
  <source src="./assets/demo-1-simple-state.mov" type="video/mp4"/>
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F1SimpleState.tsx)

## 2. Add selectors for derived state

```tsx
const nameStore = adapt('Bob', {
  selectors: {
    yelledName: name => name.toUpperCase(), // Will be memoized
  },
});

function DerivedState() {
  const name = useStore(nameStore);
  return (
    <>
      <h2>Hello {name.state}!</h2>
      <h2>Hello {name.yelledName}!</h2>
      <button onClick={() => nameStore.set('Bilbo')}>Change Name</button>
    </>
  );
}
```

<video controls loop>
  <source src="./assets/demo-2-derived-state.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F2DerivedState.tsx)

## 3. Define state changes declaratively in stores

Maintain separation of concerns by keeping state logic together instead of scattered.

```diff-tsx
 const nameStore = adapt('Bob', {
+  reverseName: name => name.split('').reverse().join(''),
  selectors: {
    yelledName: name => name.toUpperCase(), // Will be memoized
  },
});

function DerivedState() {
  const name = useStore(nameStore);
  return (
    < >
      <h2>Hello {name.yelledName}!</h2>
      <button onClick={() => nameStore.set('Bilbo')}>Change Name</button>
+      <button onClick={() => nameStore.reverseName()}>Reverse Name</button>
    </>
  );
}
```

<video controls loop>
  <source src="./assets/demo-3-state-changes.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F3StateChanges.tsx)

## 4. Reuse state patterns with state adapters

```diff-tsx
- const nameStore = adapt('Bob', {
+ const nameAdapter = createAdapter<string>()({
  reverseName: name => name.split('').reverse().join(''),
  selectors: {
    yelledName: name => name.toUpperCase(), // Will be memoized
  },
});
+const name1Store = adapt('Bob', nameAdapter);
+const name2Store = adapt('Bob', nameAdapter);

function StateAdapters() {
-  const name = useStore(nameStore);
+  const name1 = useStore(name1Store);
+  const name2 = useStore(name2Store);
  return (
    < >
      <h2>Hello {name1.yelledName}!</h2>
      <button onClick={() => name1Store.set('Bilbo')}>Change Name</button>
      <button onClick={() => name1Store.reverseName()}>Reverse Name</button>
+
+      <h1>Hello { name2.yelledName }!</h1>
+      <button onClick={() => name2Store.set('Bilbo')}>Change Name</button>
+      <button onClick={() => name2Store.reverseName()}>Reverse Name</button>
    </>
  );
}
```

<video controls loop>
  <source src="./assets/demo-4-state-adapters.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F4StateAdapters.tsx)

## 5. React to observable data sources

Multiple stores might need to react to the same observable, so it needs independent annotation.

```diff-tsx
 const nameAdapter = createAdapter<string>()({
  reverseName: name => name.split('').reverse().join(''),
+  concatName: (name, anotherName: string) => `${name} ${anotherName}`,
  selectors: {
    yelledName: name => name.toUpperCase(), // Will be memoized
  },
});

+const nameFromServer$ = timer(3000).pipe(
+  mapTo('Joel'),
+  toSource('[name] nameFromServer$'), // Annotate for Redux Devtools
+);
+
-const name1Store = adapt('Bob', nameAdapter);
+const name1Store = adapt('Bob', {
+  adapter: nameAdapter,
+  sources: nameFromServer$, // Set state
+});
-const name2Store = adapt('Bob', nameAdapter);
+const name2Store = adapt('Bob', {
+  adapter: nameAdapter,
+  sources: {
+    concatName: nameFromServer$, // Trigger a specific state reaction
+  },
+});

function ObservableSources() {
  const name1 = useStore(name1Store);
  const name2 = useStore(name2Store);
  return (
    <>
      <h2>Hello {name1.yelledName}!</h2>
      <button onClick={() => name1Store.set('Bilbo')}>Change Name</button>
      <button onClick={() => name1Store.reverseName()}>Reverse Name</button>

      <h1>Hello { name2.yelledName }!</h1>
      <button onClick={() => name2Store.set('Bilbo')}>Change Name</button>
      <button onClick={() => name2Store.reverseName()}>Reverse Name</button>
    </>
  );
}
```

<video controls loop>
  <source src="./assets/demo-5-observable-sources.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F5ObservableSources.tsx)

## 6. Share DOM event sources with multiple stores

Don't write callback functions to imperatively change state in multiple stores. Instead, declare the DOM event as an independent source that multiple stores can react to.

```diff-tsx
 const nameAdapter = createAdapter<string>()({
  reverseName: name => name.split('').reverse().join(''),
  concatName: (name, anotherName: string) => `${name} ${anotherName}`,
  selectors: {
    yelledName: name => name.toUpperCase(), // Will be memoized
  },
});

const nameFromServer$ = timer(3000).pipe(
  mapTo('Joel'),
  toSource('[name] nameFromServer$'), // Annotate for Redux Devtools
);

+const resetBoth$ = new Source<void>('[name] resetBoth$'); // Annotate for Redux Devtools
+
const name1Store = adapt('Bob', {
  adapter: nameAdapter,
-   sources: nameFromServer$, // Set state
+   sources: {
+     set: nameFromServer$, // `set` is provided with all adapters
+     reset: resetBoth$, // `reset` is provided with all adapters
+   },
});
const name2Store = adapt('Bob', {
  adapter: nameAdapter,
   sources: {
     concatName: nameFromServer$, // Trigger a specific state reaction
+     reset: resetBoth$, // `reset` is provided with all adapters
   },
});

function SharedSources() {
  const name1 = useStore(name1Store);
  const name2 = useStore(name2Store);
  return (
    <>
      <h2>Hello {name1.yelledName}!</h2>
      <button onClick={() => name1Store.set('Bilbo')}>Change Name</button>
      <button onClick={() => name1Store.reverseName()}>Reverse Name</button>

      <h1>Hello { name2.yelledName }!</h1>
      <button onClick={() => name2Store.set('Bilbo')}>Change Name</button>
      <button onClick={() => name2Store.reverseName()}>Reverse Name</button>
+
+      <button onClick={() => resetBoth$.next()}>Reset Both</button>
    </>
  );
}
```

<video controls loop>
  <source src="./assets/demo-6-dom-sources.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F6DomSources.tsx)

## 7. Select state from multiple stores

```diff-tsx
 const nameAdapter = createAdapter<string>()({
  reverseName: name => name.split('').reverse().join(''),
  concatName: (name, anotherName: string) => `${name} ${anotherName}`,
  selectors: {
    yelledName: name => name.toUpperCase(), // Will be memoized
  },
});

const nameFromServer$ = timer(3000).pipe(
  mapTo('Joel'),
  toSource('[name] nameFromServer$'), // Annotate for Redux Devtools
);

const resetBoth$ = new Source<void>('[name] resetBoth$'); // Annotate for Redux Devtools

const name1Store = adapt('Bob', {
  adapter: nameAdapter,
  sources: {
    set: nameFromServer$, // `set` is provided with all adapters
    reset: resetBoth$, // `reset` is provided with all adapters
  },
});
const name2Store = adapt('Bob', {
  adapter: nameAdapter,
  sources: {
    concatName: nameFromServer$, // Trigger a specific state reaction
    reset: resetBoth$, // `reset` is provided with all adapters
  },
});

+const name12Store = joinStores({
+  name1: name1Store,
+  name2: name2Store,
+})({
+  bothBobs: s => s.name1 === 'Bob' && s.name2 === 'Bob'
+})();
+
function SharedSources() {
  const name1 = useStore(name1Store);
  const name2 = useStore(name2Store);
+  const { bothBobs } = useStore(name12Store);
  return (
    <>
      <h2>Hello {name1.yelledName}!</h2>
      <button onClick={() => name1Store.set('Bilbo')}>Change Name</button>
      <button onClick={() => name1Store.reverseName()}>Reverse Name</button>

      <h1>Hello { name2.yelledName }!</h1>
      <button onClick={() => name2Store.set('Bilbo')}>Change Name</button>
      <button onClick={() => name2Store.reverseName()}>Reverse Name</button>

      <button onClick={() => resetBoth$.next()}>Reset Both</button>
+
+      {bothBobs && <h2>Hello Bobs!</h2>}
    </>
  );
}
```

<video controls loop>
  <source src="./assets/demo-7-multi-store-selectors.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F7MultiStoreSelectors.tsx)
