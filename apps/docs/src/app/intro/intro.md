## 1. Start with simple state

```typescript
export class NameComponent {
  nameStore = adapt('name', 'Bob'); // 'name' is the namespace for Redux Devtools
}
```

```html
<h1>Hello {{ nameStore.state$ | async }}!</h1>
<button (click)="nameStore.set('Bilbo')">Change Name</button>
```

<video autoplay loop>
  <source src="../assets/demo-1-simple-state.mov" type="video/mp4"/>
</video>

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F1-simple-state.component.ts)

## 2. Add selectors for derived state

```typescript
export class NameComponent {
  nameStore = adapt(['name', 'Bob'], {
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

<video autoplay loop>
  <source src="../assets/demo-2-derived-state.mov" type="video/mp4" />
</video>

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F2-derived-state.component.ts)

<!--
Need to figure out how to compile the markdown at build time.
Maybe a custom builder like this:
https://www.thisdot.co/blog/angular-custom-builders-markdown-angular
https://github.com/flakolefluk/md-builder
 -->

## 3. Define state changes declaratively in stores

Maintain separation of concerns by keeping state logic together instead of scattered.

```diff-typescript
export class NameComponent {
  nameStore = adapt(['name', 'Bob'], {
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

<video autoplay loop>
  <source src="../assets/demo-3-state-changes.mp4" type="video/mp4" />
</video>

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F3-state-changes.component.ts)

## 4. Reuse state patterns with state adapters

```diff-typescript
export class NameComponent {
-  nameStore = adapt(['name', 'Bob'], {
+  nameAdapter = createAdapter<string>()({
    reverseName: name => name.split('').reverse().join(''),
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });
+
+  name1Store = adapt(['name1', 'Bob'], this.nameAdapter);
+  name2Store = adapt(['name2', 'Bob'], this.nameAdapter);
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

<video autoplay loop>
  <source src="../assets/demo-4-state-adapters.mp4" type="video/mp4" />
</video>

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F4-state-adapters.component.ts)

Soon we'll be publishing adapters for common patterns: Lists, async state, pagination, etc…

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
-  name1Store = adapt(['name1', 'Bob'], this.nameAdapter);
+  name1Store = adapt(['name1', 'Bob', this.nameAdapter], this.nameFromServer$);//Set state
-  name2Store = adapt(['name2', 'Bob'], this.nameAdapter);
+  name2Store = adapt(['name2', 'Bob', this.nameAdapter], {
+    concatName: this.nameFromServer$, // Trigger a specific state reaction
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

<video autoplay loop>
  <source src="../assets/demo-5-observable-sources.mp4" type="video/mp4" />
</video>

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F5-observable-sources.component.ts)

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

  name1Store = adapt(['name1', 'Bob', this.nameAdapter], {
+    set: this.nameFromServer$, // `set` is provided with all adapters
+    reset: this.resetBoth$, // `reset` is provided with all adapters
  });
  name2Store = adapt(['name2', 'Bob', this.nameAdapter], {
    concatName: this.nameFromServer$,
+    reset: this.resetBoth$, // `reset` is provided with all adapters
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

<video autoplay loop>
  <source src="../assets/demo-6-dom-sources.mp4" type="video/mp4" />
</video>

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F6-dom-sources.component.ts)

## StateAdapt Philosophy

We encourage following 3 rules for progressive reactivity:

1. Keep code declarative by introducing reactivity instead of imperative code.
2. Don't write callback functions.
3. Wrap imperative APIs with declarative ones.

[Learn more](https://medium.com/weekly-webtips/introducing-stateadapt-reusable-reactive-state-management-9f0388f1850e)

## Set up StateAdapt in your project

[Set up StateAdapt in your project ](/getting-started)

Currently works with:

- Angular
- Angular + NgRx
- Angular + NGXS
- React
- React + Redux

## StateAdapt in action

[StackBlitz examples](/demos)

[Real World App](https://github.com/mfp22/stefanoslig-angular-14-ngrx-nx-realworld-example-app/tree/state-adapt) —
A Medium clone originally created by Thinkster for demonstrating various technologies on a nontrivial scale — See [the original repo](https://github.com/gothinkster/realworld).

[Angular state management library comparison app](https://github.com/dherrero/angular-state-manager) —
A repo that has implemented the same feature with NgRx, Elf, NGXS, StateAdapt and a custom Flux pattern using a generic class

[Shopping Cart Example](https://github.com/mfp22/ngrx-example/commit/4d701533b22d4a35328fbf8ae46493dd8347c87e)

[Server-driven counter app with aggregate page](https://github.com/mfp22/redux-client-ngrx/tree/state-adapt)

[Simple city app](https://github.com/mfp22/Cities-NGRX/commit/83f35e81f36f183bc1632004b505668f063f10e9)

**Have a project you'd like to see implemented in StateAdapt? Open an issue at [our GitHub repo](https://github.com/state-adapt/state-adapt), and if it's different enough from existing examples we might convert it and add here.**

## Contribute

Open an issue, request a feature, or ask for help at [our GitHub repo](https://github.com/state-adapt/state-adapt)
