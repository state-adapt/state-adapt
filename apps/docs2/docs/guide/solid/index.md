## 1. Start with simple state

StateAdapt stores can be as simple as `createSignal` or RxJS `BehaviorSubject`s:

```tsx
function SimpleState() {
  const nameStore = adapt('Bob');
  const name = fromAdapt(nameStore);
  return (
    <>
      <h2>Hello {name.state()}!</h2>
      <button onClick={() => nameStore.set('Bilbo')}>Change Name</button>
    </>
  );
}
```

<!-- <video controls loop>
  <source src="./assets/demo-1-simple-state.mov" type="video/mp4"/>
</video> -->

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-cwd8th?file=src%2F1SimpleState.tsx)

## 2. Add selectors for derived state

```tsx
function DerivedState() {
  const nameStore = adapt('Bob', {
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });
  const name = fromAdapt(nameStore);
  return (
    <>
      <h2>Hello {name.state()}!</h2>
      <h2>Hello {name.yelledName()}!</h2>
      <button onClick={() => nameStore.set('Bilbo')}>Change Name</button>
    </>
  );
}
```

<!-- <video controls loop>
  <source src="./assets/demo-2-derived-state.mov" type="video/mp4" />
</video> -->

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-cwd8th?file=src%2F2DerivedState.tsx)

## 3. Define state changes declaratively in stores

Maintain separation of concerns by keeping state logic together instead of scattered.

```diff-tsx
function StateChanges() {
  const nameStore = adapt('Bob', {
+    reverseName: (name) => name.split('').reverse().join(''),
    selectors: {
      yelledName: (name) => name.toUpperCase(), // Will be memoized
    },
  });
  const name = fromAdapt(nameStore);
  return (
    <>
      <h2>Hello {name.yelledName()}!</h2>
      <button onClick={() => nameStore.set('Bilbo')}>Change Name</button>
+      <button onClick={() => nameStore.reverseName()}>Reverse Name</button>
    </>
  );
}
```

<!-- <video controls loop>
  <source src="./assets/demo-3-state-changes.mov" type="video/mp4" />
</video> -->

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-cwd8th?file=src%2F3StateChanges.tsx)

## 4. Reuse state patterns with state adapters

```diff-tsx
+const nameAdapter = createAdapter<string>()({
  reverseName: (name) => name.split('').reverse().join(''),
  selectors: {
    yelledName: (name) => name.toUpperCase(), // Will be memoized
  },
});

function StateAdapters() {
  const nameStore1 = adapt('Bob', nameAdapter);
  const name1 = fromAdapt(nameStore1);

+  const nameStore2 = adapt('Bob', nameAdapter);
+  const name2 = fromAdapt(nameStore2);
  return (
    <>
      <h2>Hello {name1.yelledName()}!</h2>
      <button onClick={() => nameStore1.set('Bilbo')}>Change Name</button>
      <button onClick={() => nameStore1.reverseName()}>Reverse Name</button>

+      <h2>Hello {name2.yelledName()}!</h2>
+      <button onClick={() => nameStore2.set('Bilbo')}>Change Name</button>
+      <button onClick={() => nameStore2.reverseName()}>Reverse Name</button>
    </>
  );
}
```

<!-- <video controls loop>
  <source src="./assets/demo-4-state-adapters.mov" type="video/mp4" />
</video> -->

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-cwd8th?file=src%2F4StateAdapters.tsx)

## 5. React to observable data sources

Multiple stores might need to react to the same observable, so it needs independent annotation.

```diff-tsx
const nameAdapter = createAdapter<string>()({
  reverseName: (name) => name.split('').reverse().join(''),
+  concatName: (name, anotherName: string) => `${name} ${anotherName}`,
  selectors: {
    yelledName: (name) => name.toUpperCase(), // Will be memoized
  },
});

+const onNameFromServer = timer(3000).pipe(map(() => 'Joel'));

function ObservableSources() {
-  const nameStore1 = adapt('Bob', nameAdapter);
+  const nameStore1 = adapt('Bob', {
+    adapter: nameAdapter,
+    sources: onNameFromServer, // Set state
+  });
  const name1 = fromAdapt(nameStore1);

-  const nameStore2 = adapt('Bob', nameAdapter);
+  const nameStore2 = adapt('Bob', {
+    adapter: nameAdapter,
+    sources: {
+      concatName: onNameFromServer, // Trigger a specific state reaction
+    },
+  });
  const name2 = fromAdapt(nameStore2);
  return (
    <>
      <h2>Hello {name1.yelledName()}!</h2>
      <button onClick={() => nameStore1.set('Bilbo')}>Change Name</button>
      <button onClick={() => nameStore1.reverseName()}>Reverse Name</button>

      <h2>Hello {name2.yelledName()}!</h2>
      <button onClick={() => nameStore2.set('Bilbo')}>Change Name</button>
      <button onClick={() => nameStore2.reverseName()}>Reverse Name</button>
    </>
  );
}
```

<!-- <video controls loop>
  <source src="./assets/demo-5-observable-sources.mov" type="video/mp4" />
</video> -->

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-cwd8th?file=src%2F5ObservableSources.tsx)

## 6. Share DOM event sources with multiple stores

Don't write callback functions to imperatively change state in multiple stores. Instead, declare the DOM event as an independent source that multiple stores can react to.

```diff-tsx
const nameAdapter = createAdapter<string>()({
  reverseName: (name) => name.split('').reverse().join(''),
  concatName: (name, anotherName: string) => `${name} ${anotherName}`,
  selectors: {
    yelledName: (name) => name.toUpperCase(), // Will be memoized
  },
});

+const onResetBoth = source();

const onNameFromServer = timer(3000).pipe(map(() => 'Joel'));

function DomSources() {
  const nameStore1 = adapt('Bob', {
    adapter: nameAdapter,
-    sources: onNameFromServer, // Set state
+    sources: {
+      set: onNameFromServer, // `set` is provided with all adapters
+      reset: onResetBoth, // `reset` is provided with all adapters
+    },
  });
  const name1 = fromAdapt(nameStore1);

  const nameStore2 = adapt('Bob', {
    adapter: nameAdapter,
    sources: {
      concatName: onNameFromServer, // Trigger a specific state reaction
+      reset: onResetBoth, // `reset` is provided with all adapters
    },
  });
  const name2 = fromAdapt(nameStore2);
  return (
    <>
      <h2>Hello {name1.yelledName()}!</h2>
      <button onClick={() => nameStore1.set('Bilbo')}>Change Name</button>
      <button onClick={() => nameStore1.reverseName()}>Reverse Name</button>

      <h2>Hello {name2.yelledName()}!</h2>
      <button onClick={() => nameStore2.set('Bilbo')}>Change Name</button>
      <button onClick={() => nameStore2.reverseName()}>Reverse Name</button>

+      <button onClick={onResetBoth}>Reset Both</button>
    </>
  );
}
```

<!-- <video controls loop>
  <source src="./assets/demo-6-dom-sources.mov" type="video/mp4" />
</video> -->

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-cwd8th?file=src%2F6DomSources.tsx)

## 7. Select state from multiple stores

```diff-tsx
const nameAdapter = createAdapter<string>()({
  reverseName: (name) => name.split('').reverse().join(''),
  concatName: (name, anotherName: string) => `${name} ${anotherName}`,
  selectors: {
    yelledName: (name) => name.toUpperCase(), // Will be memoized
  },
});

const onResetBoth = source();

const onNameFromServer = timer(3000).pipe(map(() => 'Joel'));

function MultiStoreSelectors() {
  const nameStore1 = adapt('Bob', {
    adapter: nameAdapter,
    sources: {
      set: onNameFromServer, // `set` is provided with all adapters
      reset: onResetBoth, // `reset` is provided with all adapters
    },
  });
  const name1 = fromAdapt(nameStore1);

  const nameStore2 = adapt('Bob', {
    adapter: nameAdapter,
    sources: {
      concatName: onNameFromServer, // Trigger a specific state reaction
      reset: onResetBoth, // `reset` is provided with all adapters
    },
  });
  const name2 = fromAdapt(nameStore2);

+  const bothBobs = () => name1.state() === 'Bob' && name2.state() === 'Bob';

  return (
    <>
      <h2>Hello {name1.yelledName()}!</h2>
      <button onClick={() => nameStore1.set('Bilbo')}>Change Name</button>
      <button onClick={() => nameStore1.reverseName()}>Reverse Name</button>

      <h2>Hello {name2.yelledName()}!</h2>
      <button onClick={() => nameStore2.set('Bilbo')}>Change Name</button>
      <button onClick={() => nameStore2.reverseName()}>Reverse Name</button>

      <button onClick={onResetBoth}>Reset Both</button>

+      {bothBobs() && <h2>Hello Bobs!</h2>}
    </>
  );
}
```

<!-- <video controls loop>
  <source src="./assets/demo-7-multi-store-selectors.mov" type="video/mp4" />
</video> -->

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-cwd8th?file=src%2F7MultiStoreSelectors.tsx)
