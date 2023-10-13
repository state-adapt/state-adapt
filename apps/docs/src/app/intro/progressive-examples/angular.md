## 1. Start with simple state

StateAdapt stores can be as simple as RxJS `BehaviorSubject`s, but with Redux Devtools support!

```tsx
export class NameComponent {
  nameStore = adapt('Bob');
}
```

```html
<h1>Hello {{ nameStore.state$ | async }}!</h1>
<button (click)="nameStore.set('Bilbo')">Change Name</button>
```

Here it is in Redux Devtools:

<video controls loop>
  <source src="./assets/demo-1-simple-state.mov" type="video/mp4"/>
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F1-simple-state.component.ts)

## 2. Add selectors for derived state

```typescript
export class NameComponent {
  nameStore = adapt('Bob', {
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });
}
```

```html
<h1>Hello {{ nameStore.state$ | async }}!</h1>
<h1>Hello {{ nameStore.yelledName$ | async }}!</h1>
<button (click)="nameStore.set('Bilbo')">Change Name</button>
```

<video controls loop>
  <source src="./assets/demo-2-derived-state.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F2-derived-state.component.ts)

## 3. Define state changes declaratively in stores

Maintain separation of concerns by keeping state logic together instead of scattered.

```diff-typescript
export class NameComponent {
  nameStore = adapt('Bob', {
+    reverseName: name => name.split('').reverse().join(''),
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });
}
```

```diff-html
 <h1>Hello {{ nameStore.yelledName$ | async }}!</h1>
 <button (click)="nameStore.set('Bilbo')">Change Name</button>
+ <button (click)="nameStore.reverseName()">Reverse Name</button>
```

<video controls loop>
  <source src="./assets/demo-3-state-changes.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F3-state-changes.component.ts)

## 4. Reuse state patterns with state adapters

If you need to reuse state logic, it's as simple as dragging it outside the `adapt` call into a `createAdapter` call.

```diff-typescript
export class NameComponent {
-  nameStore = adapt('Bob', {
+  nameAdapter = createAdapter<string>()({
    reverseName: name => name.split('').reverse().join(''),
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });
+
+  name1Store = adapt('Bob', this.nameAdapter);
+  name2Store = adapt('Bob', this.nameAdapter);
}
```

```diff-html
 <h1>Hello {{ name1Store.yelledName$ | async }}!</h1>
 <button (click)="name1Store.set('Bilbo')">Change Name</button>
 <button (click)="name1Store.reverseName()">Reverse Name</button>
+
+ <h1>Hello {{ name2Store.yelledName$ | async }}!</h1>
+ <button (click)="name2Store.set('Bilbo')">Change Name</button>
+ <button (click)="name2Store.reverseName()">Reverse Name</button>
```

<video controls loop>
  <source src="./assets/demo-4-state-adapters.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F4-state-adapters.component.ts)

## 5. React to observable data sources

Multiple stores might need to react to the same observable, so it needs independent annotation.

```diff-typescript
export class NameComponent {
  nameAdapter = createAdapter<string>()({
    reverseName: name => name.split('').reverse().join(''),
+    concatName: (name, anotherName: string) => `${name} ${anotherName}`,
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });

+  nameFromServer$ = timer(3000).pipe(
+    mapTo('Joel'),
+    toSource('[name] nameFromServer$'), // Annotate for Redux Devtools
+  );
+
-  name1Store = adapt('Bob', this.nameAdapter);
+  name1Store = adapt('Bob', {
+    adapter: this.nameAdapter,
+    sources: this.nameFromServer$, // Set state
+  });
-  name2Store = adapt('Bob', this.nameAdapter);
+  name2Store = adapt('Bob', {
+    adapter: this.nameAdapter,
+    sources: {
+      concatName: this.nameFromServer$, // Trigger a specific state reaction
+    },
+  });
}
```

```html
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

### Try it on [StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F5-observable-sources.component.ts)

## 6. Share DOM event sources with multiple stores

Don't write callback functions to imperatively change state in multiple stores. Instead, declare the DOM event as an independent source that multiple stores can react to.

```diff-typescript
export class NameComponent {
  nameAdapter = createAdapter<string>()({
    reverseName: name => name.split('').reverse().join(''),
    concatName: (name, anotherName: string) => `${name} ${anotherName}`,
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });

+  resetBoth$ = new Source<void>('[name] resetBoth$'); // Annotate for Redux Devtools
+
  nameFromServer$ = timer(3000).pipe(
    mapTo('Joel'),
    toSource('[name] nameFromServer$'), // Annotate for Redux Devtools
  );

  name1Store = adapt('Bob', {
    adapter: this.nameAdapter,
-    sources: this.nameFromServer$, // Set state
+    sources: {
+      set: this.nameFromServer$, // `set` is provided with all adapters
+      reset: this.resetBoth$, // `reset` is provided with all adapters
+    },
  });
  name2Store = adapt('Bob', {
    adapter: this.nameAdapter,
    sources: {
      concatName: this.nameFromServer$, // Trigger a specific state reaction
+      reset: this.resetBoth$, // `reset` is provided with all adapters
    },
  });
}
```

```diff-html
 <h1>Hello {{ name1Store.yelledName$ | async }}!</h1>
 <button (click)="name1Store.set('Bilbo')">Change Name</button>
 <button (click)="name1Store.reverseName()">Reverse Name</button>

 <h1>Hello {{ name2Store.yelledName$ | async }}!</h1>
 <button (click)="name2Store.set('Bilbo')">Change Name</button>
 <button (click)="name2Store.reverseName()">Reverse Name</button>
+
+ <button (click)="resetBoth$.next()">Reset Both</button>
```

<video controls loop>
  <source src="./assets/demo-6-dom-sources.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F6-dom-sources.component.ts)

## 7. Select state from multiple stores

```diff-typescript
export class NameComponent {
  nameAdapter = createAdapter<string>()({
    reverseName: name => name.split('').reverse().join(''),
    concatName: (name, anotherName: string) => `${name} ${anotherName}`,
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });

  resetBoth$ = new Source<void>('[name] resetBoth$'); // Annotate for Redux Devtools

  nameFromServer$ = timer(3000).pipe(
    mapTo('Joel'),
    toSource('[name] nameFromServer$'), // Annotate for Redux Devtools
  );

  name1Store = adapt('Bob', {
    adapter: this.nameAdapter,
    sources: {
      set: this.nameFromServer$, // `set` is provided with all adapters
      reset: this.resetBoth$, // `reset` is provided with all adapters
    },
  });
  name2Store = adapt('Bob', {
    adapter: this.nameAdapter,
    sources: {
      concatName: this.nameFromServer$, // Trigger a specific state reaction
      reset: this.resetBoth$, // `reset` is provided with all adapters
    },
  });
+
+  bothBobs$ = joinStores({
+    name1: this.name1Store,
+    name2: this.name2Store,
+  })({
+    bothBobs: s => s.name1 === 'Bob' && s.name2 === 'Bob',
+  })().bothBobs$;
}
```

```diff-html
 <h1>Hello {{ name1Store.yelledName$ | async }}!</h1>
 <button (click)="name1Store.set('Bilbo')">Change Name</button>
 <button (click)="name1Store.reverseName()">Reverse Name</button>

 <h1>Hello {{ name2Store.yelledName$ | async }}!</h1>
 <button (click)="name2Store.set('Bilbo')">Change Name</button>
 <button (click)="name2Store.reverseName()">Reverse Name</button>

 <button (click)="resetBoth$.next()">Reset Both</button>
+
+ <h2 *ngIf="bothBobs$ | async">Hello Bobs!</h2>
```

<video controls loop>
  <source src="./assets/demo-7-multi-store-selectors.mov" type="video/mp4" />
</video>

### Try it on [StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F7-multi-store-selectors.component.ts)
