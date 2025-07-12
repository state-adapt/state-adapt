# Incremental Complexity

## 1. Start with simple state

StateAdapt stores can be as simple as RxJS `BehaviorSubject`s:

```typescript
export class NameComponent {
  nameStore = adapt('Bob');
}
```

```angular-html
<h1>Hello {{ nameStore.state$ | async }}!</h1>
<button (click)="nameStore.set('Bilbo')">Change Name</button>
```

<!-- <video controls loop>
  <source src="./assets/demo-1-simple-state.mov" type="video/mp4"/>
</video> -->

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F1-simple-state.component.ts)

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

```angular-html
<h1>Hello {{ nameStore.state$ | async }}!</h1>
<h1>Hello {{ nameStore.yelledName$ | async }}!</h1>
<button (click)="nameStore.set('Bilbo')">Change Name</button>
```

<!-- <video controls loop>
  <source src="./assets/demo-2-derived-state.mov" type="video/mp4" />
</video> -->

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F2-derived-state.component.ts)

## 3. Define state changes declaratively in stores

Maintain separation of concerns by keeping state logic together instead of scattered.

```typescript
export class NameComponent {
  nameStore = adapt('Bob', {
    reverseName: name => name.split('').reverse().join(''), // [!code +] // [!code ++]
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });
}
```

```angular-html
 <h1>Hello {{ nameStore.yelledName$ | async }}!</h1>
 <button (click)="nameStore.set('Bilbo')">Change Name</button>
 <button (click)="nameStore.reverseName()">Reverse Name</button> // [!code ++]
```

<!-- <video controls loop>
  <source src="./assets/demo-3-state-changes.mov" type="video/mp4" />
</video> -->

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F3-state-changes.component.ts)

## 4. Reuse state patterns with state adapters

If you need to reuse state logic, it's as simple as dragging it outside the `adapt` call into a `createAdapter` call.

```typescript
export class NameComponent {
  nameStore = adapt('Bob', { // [!code --]
  nameAdapter = createAdapter<string>()({ // [!code ++]
    reverseName: name => name.split('').reverse().join(''),
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });

  name1Store = adapt('Bob', this.nameAdapter); // [!code ++]
  name2Store = adapt('Bob', this.nameAdapter); // [!code ++]
}
```

```angular-html
 <h1>Hello {{ name1Store.yelledName$ | async }}!</h1>
 <button (click)="name1Store.set('Bilbo')">Change Name</button>
 <button (click)="name1Store.reverseName()">Reverse Name</button>

 <h1>Hello {{ name2Store.yelledName$ | async }}!</h1> // [!code ++]
 <button (click)="name2Store.set('Bilbo')">Change Name</button> // [!code ++]
 <button (click)="name2Store.reverseName()">Reverse Name</button> // [!code ++]
```

<!-- <video controls loop>
  <source src="./assets/demo-4-state-adapters.mov" type="video/mp4" />
</video> -->

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F4-state-adapters.component.ts)

## 5. React to observable data sources

Multiple stores might need to react to the same observable, so it needs independent annotation.

```typescript
export class NameComponent {
  nameAdapter = createAdapter<string>()({
    reverseName: name => name.split('').reverse().join(''),
    concatName: (name, anotherName: string) => `${name} ${anotherName}`, // [!code ++]
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });

  nameFromServer$ = timer(3000).pipe(map(() => 'Joel')); // [!code ++]

  name1Store = adapt('Bob', this.nameAdapter); // [!code --]
  name1Store = adapt('Bob', {
    // [!code ++]
    adapter: this.nameAdapter, // [!code ++]
    sources: this.nameFromServer$, // Set state // [!code ++]
  }); // [!code ++]
  name2Store = adapt('Bob', this.nameAdapter); // [!code --]
  name2Store = adapt('Bob', {
    // [!code ++]
    adapter: this.nameAdapter, // [!code ++]
    sources: {
      // [!code ++]
      concatName: this.nameFromServer$, // Trigger a specific state reaction // [!code ++]
    }, // [!code ++]
  }); // [!code ++]
}
```

```angular-html
<h1>Hello {{ name1Store.yelledName$ | async }}!</h1>
<button (click)="name1Store.set('Bilbo')">Change Name</button>
<button (click)="name1Store.reverseName()">Reverse Name</button>

<h1>Hello {{ name2Store.yelledName$ | async }}!</h1>
<button (click)="name2Store.set('Bilbo')">Change Name</button>
<button (click)="name2Store.reverseName()">Reverse Name</button>
```

<!-- <video controls loop>
  <source src="./assets/demo-5-observable-sources.mov" type="video/mp4" />
</video> -->

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F5-observable-sources.component.ts)

## 6. Share DOM event sources with multiple stores

Don't write callback functions to imperatively change state in multiple stores. Instead, declare the DOM event as an independent source that multiple stores can react to.

```typescript
export class NameComponent {
  nameAdapter = createAdapter<string>()({
    reverseName: name => name.split('').reverse().join(''),
    concatName: (name, anotherName: string) => `${name} ${anotherName}`,
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });

  resetBoth$ = source(); // [!code ++]

  nameFromServer$ = timer(3000).pipe(map(() => 'Joel'));

  name1Store = adapt('Bob', {
    adapter: this.nameAdapter,
    sources: this.nameFromServer$, // Set state // [!code --]
    sources: {
      // [!code ++]
      set: this.nameFromServer$, // `set` is provided with all adapters // [!code ++]
      reset: this.resetBoth$, // `reset` is provided with all adapters // [!code ++]
    }, // [!code ++]
  });
  name2Store = adapt('Bob', {
    adapter: this.nameAdapter,
    sources: {
      concatName: this.nameFromServer$, // Trigger a specific state reaction
      reset: this.resetBoth$, // `reset` is provided with all adapters // [!code ++]
    },
  });
}
```

```angular-html
 <h1>Hello {{ name1Store.yelledName$ | async }}!</h1>
 <button (click)="name1Store.set('Bilbo')">Change Name</button>
 <button (click)="name1Store.reverseName()">Reverse Name</button>

 <h1>Hello {{ name2Store.yelledName$ | async }}!</h1>
 <button (click)="name2Store.set('Bilbo')">Change Name</button>
 <button (click)="name2Store.reverseName()">Reverse Name</button>

 <button (click)="resetBoth$.next()">Reset Both</button> // [!code ++]
```

<!-- <video controls loop>
  <source src="./assets/demo-6-dom-sources.mov" type="video/mp4" />
</video> -->

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F6-dom-sources.component.ts)

## 7. Select state from multiple stores

```typescript
export class NameComponent {
  nameAdapter = createAdapter<string>()({
    reverseName: name => name.split('').reverse().join(''),
    concatName: (name, anotherName: string) => `${name} ${anotherName}`,
    selectors: {
      yelledName: name => name.toUpperCase(), // Will be memoized
    },
  });

  resetBoth$ = source();

  nameFromServer$ = timer(3000).pipe(map(() => 'Joel'));

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

  bothBobs$ = joinStores({
    // [!code ++]
    name1: this.name1Store, // [!code ++]
    name2: this.name2Store, // [!code ++]
  })({
    // [!code ++]
    bothBobs: s => s.name1 === 'Bob' && s.name2 === 'Bob', // [!code ++]
  })().bothBobs$; // [!code ++]
}
```

```angular-html
 <h1>Hello {{ name1Store.yelledName$ | async }}!</h1>
 <button (click)="name1Store.set('Bilbo')">Change Name</button>
 <button (click)="name1Store.reverseName()">Reverse Name</button>

 <h1>Hello {{ name2Store.yelledName$ | async }}!</h1>
 <button (click)="name2Store.set('Bilbo')">Change Name</button>
 <button (click)="name2Store.reverseName()">Reverse Name</button>

 <button (click)="resetBoth$.next()">Reset Both</button>

 <h2 *ngIf="bothBobs$ | async">Hello Bobs!</h2> // [!code ++]
```

<!-- <video controls loop>
  <source src="./assets/demo-7-multi-store-selectors.mov" type="video/mp4" />
</video> -->

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F7-multi-store-selectors.component.ts)
