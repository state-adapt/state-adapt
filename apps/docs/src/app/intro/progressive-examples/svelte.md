## 1. Start with simple state

StateAdapt stores can be as simple as Svelte stores or RxJS `BehaviorSubject`s, but with Redux Devtools support!

```tsx
const nameStore = adapt('Bob'); // 'name' is for Redux Devtools
const name$ = nameStore.state$;
```

```svelte
<h2>Hello {$name$}!</h2>
<button on:click={() => nameStore.set('Bilbo')}>Change Name</button>
```

Here it is in Redux Devtools:

<video controls loop>
  <source src="./assets/demo-1-simple-state.mov" type="video/mp4"/>
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-74p4ry?file=src%2Flib%2F1-simple-state.svelte&terminal=dev)

## 2. Add selectors for derived state

Derived state defined in selectors can be moved outside of components without refactoring.

```typescript
const nameStore = adapt('Bob', {
  selectors: {
    yelledName: name => name.toUpperCase(), // Will be memoized
  },
});
const name$ = nameStore.state$;
const yelledName$ = nameStore.yelledName$;
```

```svelte
<h2>Hello {$name$}!</h2>
<h2>Hello { $yelledName$ }!</h2>
<button on:click={() => nameStore.set('Bilbo')}>Change Name</button>
```

<video controls loop>
  <source src="./assets/demo-2-derived-state.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-74p4ry?file=src%2Flib%2F2-derived-state.svelte&terminal=dev)

## 3. Define state changes declaratively in stores

Maintain separation of concerns by keeping state logic together instead of scattered.

```diff-typescript
const nameStore = adapt('Bob', {
+  reverseName: name => name.split('').reverse().join(''),
  selectors: {
    yelledName: name => name.toUpperCase(), // Will be memoized
  },
});
const yelledName$ = nameStore.yelledName$;
```

```diff-svelte
 <h2>Hello { $yelledName$ }!</h2>
 <button on:click={() => nameStore.set('Bilbo')}>Change Name</button>
+ <button on:click={() => nameStore.reverseName()}>Reverse Name</button>
```

<video controls loop>
  <source src="./assets/demo-3-state-changes.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-74p4ry?file=src%2Flib%2F3-state-changes.svelte&terminal=dev)

## 4. Reuse state patterns with state adapters

If you need to reuse state logic, it's as simple as dragging it outside the `adapt` call into a `createAdapter` call.

```diff-typescript
-  const nameStore = adapt('Bob', {
+  const nameAdapter = createAdapter<string>()({
    reverseName: name => name.split('').reverse().join(''),
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });
-  const yelledName$ = nameStore.yelledName$;
+
+  const nameStore1 = adapt('Bob', nameAdapter);
+  const yelledName1$ = nameStore1.yelledName$;
+
+  const nameStore2 = adapt('Bob', nameAdapter);
+  const yelledName2$ = nameStore2.yelledName$;
```

```diff-svelte
 <h2>Hello { $yelledName1$ }!</h2>
 <button on:click={() => nameStore1.set('Bilbo')}>Change Name</button>
 <button on:click={() => nameStore1.reverseName()}>Reverse Name</button>
+
+ <h2>Hello { $yelledName2$ }!</h2>
+ <button on:click={() => nameStore2.set('Bilbo')}>Change Name</button>
+ <button on:click={() => nameStore2.reverseName()}>Reverse Name</button>
```

<video controls loop>
  <source src="./assets/demo-4-state-adapters.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-74p4ry?file=src%2Flib%2F4-state-adapters.svelte&terminal=dev)

## 5. React to observable data sources

Multiple stores might need to react to the same observable, so it needs independent annotation.

```diff-typescript
  const nameAdapter = createAdapter<string>()({
    reverseName: name => name.split('').reverse().join(''),
+    concatName: (name, anotherName: string) => `${name} ${anotherName}`,
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });

+  const nameFromServer$ = timer(3000).pipe(
+    mapTo('Joel'),
+    toSource('[name] nameFromServer$'), // Annotate for Redux Devtools
+  );
+
-  const nameStore1 = adapt('Bob', nameAdapter);
+  const nameStore1 = adapt('Bob', {
+    adapter: nameAdapter,
+    sources: nameFromServer$, // Set state
+  });
  const yelledName1$ = nameStore1.yelledName$;

-  const nameStore2 = adapt('Bob', nameAdapter);
+  const nameStore2 = adapt('Bob', {
+    adapter: nameAdapter,
+    sources: {
+      concatName: nameFromServer$, // Trigger a specific state reaction
+    },
+  });
  const yelledName2$ = nameStore2.yelledName$;
```

```svelte
<h1>Hello {{ name1Store.yelledName$ | async }}!</h1>
<button (click)="name1Store.set('Bilbo')">Change Name</button>
<button (click)="name1Store.reverseName()">Reverse Name</button>

<h1>Hello {{ name2Store.yelledName$ | async }}!</h1>
<button (click)="name2Store.set('Bilbo')">Change Name</button>
<button (click)="name2Store.reverseName()">Reverse Name</button>
```

<video controls loop>
  <source src="./assets/demo-5-observable-sources.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-74p4ry?file=src%2Flib%2F5-observable-sources.svelte&terminal=dev)

## 6. Share DOM event sources with multiple stores

Don't write callback functions to imperatively change state in multiple stores. Instead, declare the DOM event as an independent source that multiple stores can react to.

```diff-typescript
  const nameAdapter = createAdapter<string>()({
    reverseName: name => name.split('').reverse().join(''),
    concatName: (name, anotherName: string) => `${name} ${anotherName}`,
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });

+  const resetBoth$ = new Source<void>('[name] resetBoth$');//Annotate for Redux Devtools
+
  const nameFromServer$ = timer(3000).pipe(
    mapTo('Joel'),
    toSource('[name] nameFromServer$'), // Annotate for Redux Devtools
  );

  const nameStore1 = adapt('Bob', {
    adapter: nameAdapter,
-    sources: nameFromServer$, // Set state
+    sources: {
+      set: nameFromServer$, // `set` is provided with all adapters
+      reset: resetBoth$, // `reset` is provided with all adapters
+    },
  });
  const yelledName1$ = nameStore1.yelledName$;

  const nameStore2 = adapt('Bob', {
    adapter: nameAdapter,
    sources: {
      concatName: nameFromServer$, // Trigger a specific state reaction
+      reset: resetBoth$, // `reset` is provided with all adapters
    },
  });
  const yelledName2$ = nameStore2.yelledName$;
```

```diff-svelte
 <h1>Hello {{ name1Store.yelledName$ | async }}!</h1>
 <button (click)="name1Store.set('Bilbo')">Change Name</button>
 <button (click)="name1Store.reverseName()">Reverse Name</button>

 <h1>Hello {{ name2Store.yelledName$ | async }}!</h1>
 <button (click)="name2Store.set('Bilbo')">Change Name</button>
 <button (click)="name2Store.reverseName()">Reverse Name</button>
+
+ <button on:click={() => resetBoth$.next()}>Reset Both</button>
```

<video controls loop>
  <source src="./assets/demo-6-dom-sources.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-74p4ry?file=src%2Flib%2F6-dom-sources.svelte&terminal=dev)

## 7. Select state from multiple stores

`joinStores` can define derived state from multiple stores that can be shared bewteen multiple components.

```diff-typescript
  const nameAdapter = createAdapter<string>()({
    reverseName: name => name.split('').reverse().join(''),
    concatName: (name, anotherName: string) => `${name} ${anotherName}`,
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });

  const resetBoth$ = new Source<void>('[name] resetBoth$');//Annotate for Redux Devtools

  const nameFromServer$ = timer(3000).pipe(
    mapTo('Joel'),
    toSource('[name] nameFromServer$'), // Annotate for Redux Devtools
  );

  const nameStore1 = adapt('Bob', {
    adapter: nameAdapter,
    sources: {
      set: nameFromServer$, // `set` is provided with all adapters
      reset: resetBoth$, // `reset` is provided with all adapters
    },
  })
  const yelledName1$ = nameStore1.yelledName$;

  const nameStore2 = adapt('Bob', {
    adapter: nameAdapter,
    sources: {
      concatName: nameFromServer$, // Trigger a specific state reaction
      reset: resetBoth$, // `reset` is provided with all adapters
    },
  })
  const yelledName2$ = nameStore2.yelledName$;
+
+  const bothBobs$ = joinStores({
+    name1: nameStore1,
+    name2: nameStore2,
+  })({
+    bothBobs: s => s.name1 === 'Bob' && s.name2 === 'Bob',
+  })().bothBobs$;
```

```diff-svelte
 <h1>Hello {{ name1Store.yelledName$ | async }}!</h1>
 <button (click)="name1Store.set('Bilbo')">Change Name</button>
 <button (click)="name1Store.reverseName()">Reverse Name</button>

 <h1>Hello {{ name2Store.yelledName$ | async }}!</h1>
 <button (click)="name2Store.set('Bilbo')">Change Name</button>
 <button (click)="name2Store.reverseName()">Reverse Name</button>

 <button on:click={() => resetBoth$.next()}>Reset Both</button>
+
+ {#if $bothBobs$}
+   <h2>Hello Bobs!</h2>
+ {/if}
```

<video controls loop>
  <source src="./assets/demo-7-multi-store-selectors.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/vitejs-vite-74p4ry?file=src%2Flib%2F7-multi-store-selectors.svelte&terminal=dev)
