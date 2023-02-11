## 1. Start with simple state

StateAdapt stores can be as simple as `useState` or RxJS `BehaviorSubject`s, but with Redux Devtools support!

```tsx
function SimpleState() {
  const [name, nameStore] = useAdapt('name1', 'Bob'); // 'name' is for Redux Devtools
  return (
    <>
      <h2>Hello {name.state}!</h2>
      <button onClick={() => nameStore.set('Bilbo')}>Change Name</button>
    </>
  );
}
```

<video controls loop>
  <source src="../assets/demo-1-simple-state.mov" type="video/mp4"/>
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F1SimpleState.tsx)

## 2. Add selectors for derived state

```tsx
function DerivedState() {
  const [name, nameStore] = useAdapt(['name1', 'Bob'], {
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });
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
  <source src="../assets/demo-2-derived-state.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F2DerivedState.tsx)

<!--
Need to figure out how to compile the markdown at build time.
Maybe a custom builder like this:
https://www.thisdot.co/blog/angular-custom-builders-markdown-angular
https://github.com/flakolefluk/md-builder
 -->

## 3. Define state changes declaratively in stores

Maintain separation of concerns by keeping state logic together instead of scattered.

```diff-tsx
function DerivedState() {
  const [name, nameStore] = useAdapt(['name1', 'Bob'], {
+    reverseName: name => name.split('').reverse().join(''),
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });
  return (
    <>
      <h2>Hello {name.yelledName}!</h2>
      <button onClick={() => nameStore.set('Bilbo')}>Change Name</button>
+      <button onClick={() => nameStore.reverseName()}>Reverse Name</button>
    </>
  );
}
```

<video controls loop>
  <source src="../assets/demo-3-state-changes.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F3StateChanges.tsx)

## 4. Reuse state patterns with state adapters

```diff-tsx
+ const nameAdapter = createAdapter<string>()({
  reverseName: name => name.split('').reverse().join(''),
  selectors: {
    yelledName: name => name.toUpperCase(), // Will be memoized
  },
});
+
function StateAdapters() {
+  const [name1, name1Store] = useAdapt(['name1', 'Bob'], nameAdapter);
+  const [name2, name2Store] = useAdapt(['name2', 'Bob'], nameAdapter);
  return (
    <>
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
  <source src="../assets/demo-4-state-adapters.mov" type="video/mp4" />
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
function ObservableSources() {
-  const [name1, name1Store] = useAdapt(['name1', 'Bob'], nameAdapter);
+  const [name1, name1Store] = useAdapt(['name1', 'Bob', nameAdapter], nameFromServer$);//Set state
-  const [name2, name2Store] = useAdapt(['name2', 'Bob'], nameAdapter);
+  const [name2, name2Store] = useAdapt(['name2', 'Bob', nameAdapter], {
+    concatName: nameFromServer$, // Trigger a specific state reaction
+  });
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
  <source src="../assets/demo-5-observable-sources.mov" type="video/mp4" />
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

function SharedSources() {
  const [name1, name1Store] = useAdapt(['name1', 'Bob', nameAdapter], {
+    set: nameFromServer$, // `set` is provided with all adapters
+    reset: resetBoth$, // `reset` is provided with all adapters
  });//Set state
  const [name2, name2Store] = useAdapt(['name2', 'Bob', nameAdapter], {
    concatName: nameFromServer$, // Trigger a specific state reaction
+    reset: resetBoth$, // `reset` is provided with all adapters
  });
  return (
    <>
      <h2>Hello {name1.yelledName}!</h2>
      <button onClick={() => name1Store.set('Bilbo')}>Change Name</button>
      <button onClick={() => name1Store.reverseName()}>Reverse Name</button>

      <h1>Hello { name2.yelledName }!</h1>
      <button onClick={() => name2Store.set('Bilbo')}>Change Name</button>
      <button onClick={() => name2Store.reverseName()}>Reverse Name</button>
+
+     <button onClick={() => resetBoth$.next()}>Reset Both</button>
    </>
  );
}
```

<video controls loop>
  <source src="../assets/demo-6-dom-sources.mov" type="video/mp4" />
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


function SharedSources() {
  const [name1, name1Store] = useAdapt(['name1', 'Bob', nameAdapter], {
    set: nameFromServer$, // `set` is provided with all adapters
    reset: resetBoth$, // `reset` is provided with all adapters
  });//Set state
  const [name2, name2Store] = useAdapt(['name2', 'Bob', nameAdapter], {
    concatName: nameFromServer$, // Trigger a specific state reaction
    reset: resetBoth$, // `reset` is provided with all adapters
  });
+  const bothBobs = name1.state === 'Bob' && name2.state === 'Bob'
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
+     {bothBobs && <h2>Hello Bobs!</h2>}
    </>
  );
}
```

<video controls loop>
  <source src="../assets/demo-7-multi-store-selectors.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-thndfy?file=src%2F7MultiStoreSelectors.tsx)

## 8. Reuse state across multiple components

To reuse state across multiple components,

1. Change `useAdapt` to `adapt` and move the store creation outside the component function
2. Subscribe to the store's state in the component by passing the store into `useStore`
3. For derived state from multiple stores, create a derived store with `joinStores`

Basically,

```tsx
const [name, nameStore] = useAdapt('name', 'Bob'); // Inside component
```

becomes

```tsx
const nameStore = adapt('name', 'Bob'); // Outside component
// ...
const name = useStore(nameStore); // Inside component
```

Here's the full example.

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
+
+ const [name1, name1Store] = adapt(['name1', 'Bob', nameAdapter], {
+   set: nameFromServer$, // `set` is provided with all adapters
+   reset: resetBoth$, // `reset` is provided with all adapters
+ });//Set state
+ const [name2, name2Store] = adapt(['name2', 'Bob', nameAdapter], {
+   concatName: nameFromServer$, // Trigger a specific state reaction
+   reset: resetBoth$, // `reset` is provided with all adapters
+ });
+
+ const combinedStore = joinStores({
+   name1: name1Store,
+   name2: name2Store,
+ })({
+   bothBobs: s => s.name1 === 'Bob' && s.name2 === 'Bob',
+ })();

function SharedSources() {
-  const [name1, name1Store] = useAdapt(['name1', 'Bob', nameAdapter], {
-    set: nameFromServer$, // `set` is provided with all adapters
-    reset: resetBoth$, // `reset` is provided with all adapters
-  });//Set state
+  const name1 = useStore(name1Store);
-  const [name2, name2Store] = useAdapt(['name2', 'Bob', nameAdapter], {
-    concatName: nameFromServer$, // Trigger a specific state reaction
-    reset: resetBoth$, // `reset` is provided with all adapters
-  });
+  const name2 = useStore(name2Store);
-  const bothBobs = name1.state === 'Bob' && name2.state === 'Bob'
+  const combined = useStore(combinedStore);
  return (
    <>
      <h2>Hello {name1.yelledName}!</h2>
      <button onClick={() => name1Store.set('Bilbo')}>Change Name</button>
      <button onClick={() => name1Store.reverseName()}>Reverse Name</button>

      <h1>Hello { name2.yelledName }!</h1>
      <button onClick={() => name2Store.set('Bilbo')}>Change Name</button>
      <button onClick={() => name2Store.reverseName()}>Reverse Name</button>

      <button onClick={() => resetBoth$.next()}>Reset Both</button>

-      {bothBobs && <h2>Hello Bobs!</h2>}
+      {combined.bothBobs && <h2>Hello Bobs!</h2>}
    </>
  );
}
```
