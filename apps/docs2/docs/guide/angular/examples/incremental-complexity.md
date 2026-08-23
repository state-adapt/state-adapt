# Incremental Complexity

## `signal` without regrets

Clean state management should be easy, like `signal`.

Developers should feel completely free to use `signal` for simple features, even if they might become more complex later.

## A smooth path to reducers

When state needs to change in more complex ways, there are 2 approaches:

> **Event handlers**—scattered state logic ❌

> **Reducers**—colocated state logic ✅

Reducers are great, so StateAdapt provides a smooth path to reducers:

### 1. Replace `signal` with `adapt`

```ts
export class NameComponent {
  name = signal('Bob'); // [!code --]
  name = adapt('Bob'); // [!code ++]
}
```

```html
<h1>Hello {{ name() }}!</h1>
<button (click)="name.set('Bilbo')">Change Name</button>
```

### 2. Add Reducers

```ts
export class NameComponent {
  name = adapt('Bob'); // [!code --]
  // [!code ++:3]
  name = adapt('Bob', {
    reverse: name => name.split('').reverse().join(''),
  });
}
```

```html
<h1>Hello {{ name() }}!</h1>
<button (click)="name.set('Bilbo')">Change Name</button>
[!code ++:1]
<button (click)="name.reverse()">Reverse Name</button>
```

Result:

```ts
export class NameComponent {
  name = adapt('Bob', {
    reverse: name => name.split('').reverse().join(''),
  });
}
```

```html
<h1>Hello {{ name() }}!</h1>
<button (click)="name.set('Bilbo')">Change Name</button>
<button (click)="name.reverse()">Reverse Name</button>
```

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F1-simple-state.component.ts)

## A smooth path to state logic reuse

### Decoupled

In most state management libraries, state logic is tied to specific instances of state. This can require major refactoring if multiple states end up needing the same logic.

State adapters provide a smooth path to extracting logic away from specific event sources and state:

```ts
export class NameComponent {
  // [!code --:1]
  name = adapt('Bob', {
  // [!code ++:1]
  nameAdapter = createAdapter<string>()({
    reverse: name => name.split('').reverse().join(''),
  });

  // [!code ++:2]
  name1 = adapt('Bob', this.nameAdapter);
  name2 = adapt('Kat', this.nameAdapter);
}
```

```html
<h1>Hello {{ name1() }}!</h1>
<button (click)="name1.set('Bilbo')">Change Name</button>
<button (click)="name1.reverse()">Reverse Name</button>

<!-- [!code ++:3] -->
<h1>Hello {{ name2() }}!</h1>
<button (click)="name2.set('Bilbo')">Change Name</button>
<button (click)="name2.reverse()">Reverse Name</button>
```

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F4-state-adapters.component.ts)

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

## A smooth path to resusable derived state logic

State adapters enable reusable derived state logic with selectors:

```typescript
export class NameComponent {
  nameAdapter = createAdapter<string>()({
    reverse: name => name.split('').reverse().join(''),
    // [!code ++:4]
    selectors: {
      // Each store gets its own computed from this:
      yelled: name => name.toUpperCase(),
    },
  });

  // ...
}
```

```html
// [!code --:1]
<h1>Hello {{ name1() }}!</h1>
// [!code ++:1]
<h1>Hello {{ name1.yelled() }}!</h1>
<!-- ... -->

// [!code --:1]
<h1>Hello {{ name2() }}!</h1>
// [!code ++:1]
<h1>Hello {{ name2.yelled() }}!</h1>
<!-- ... -->
```

Result:

```ts
export class NameComponent {
  nameAdapter = createAdapter<string>()({
    reverse: name => name.split('').reverse().join(''),
    selectors: {
      yelled: name => name.toUpperCase(),
    },
  });

  name1 = adapt('Bob', this.nameAdapter);
  name2 = adapt('Kat', this.nameAdapter);
}
```

```html
<h1>Hello {{ name1.yelled() }}!</h1>
<button (click)="name1.set('Bilbo')">Change Name</button>
<button (click)="name1.reverse()">Reverse Name</button>

<h1>Hello {{ name2.yelled() }}!</h1>
<button (click)="name2.set('Bilbo')">Change Name</button>
<button (click)="name2.reverse()">Reverse Name</button>
```

<!-- TODO: Add alternative using class, once available -->

## A smooth path to reactive state

When multiple states need to change after an event, there are 2 approaches:

> **Event handlers updating multiple states**—scattered state changes ❌

> **States reacting to events**—colocated state changes ✅

Reactive state is great, but it takes a lot of work to refactor to a state management library that supports event-driven state, like Redux.

StateAdapt provides a smooth path to reactive state:

```ts
export class NameComponent {
  // ...

  resetAll$ = source(); // Shared event source // [!code ++]

  name1 = adapt('Bob', this.nameAdapter); // [!code --]
  // [!code ++:4]
  name1 = adapt('Bob', {
    adapter: this.nameAdapter,
    sources: { reset: this.resetAll$ }, // calls `reset` reducer (included)
  });
  name2 = adapt('Kat', this.nameAdapter); // [!code --]
  // [!code ++:4]
  name2 = adapt('Kat', {
    adapter: this.nameAdapter,
    sources: { reset: this.resetAll$ }, // calls `reset` reducer (included)
  });
}
```

```html
<!-- ... -->
// [!code ++:1]
<button (click)="resetAll$.next()">Reset All</button>
```

Result:

```ts
export class NameComponent {
  nameAdapter = createAdapter<string>()({
    reverse: name => name.split('').reverse().join(''),
    selectors: {
      yelled: name => name.toUpperCase(),
    },
  });

  resetAll$ = source();

  name1 = adapt('Bob', {
    adapter: this.nameAdapter,
    sources: { reset: this.resetAll$ },
  });
  name2 = adapt('Kat', {
    adapter: this.nameAdapter,
    sources: { reset: this.resetAll$ },
  });
}
```

```html
<h1>Hello {{ name1.yelled() }}!</h1>
<button (click)="name1.set('Bilbo')">Change Name</button>
<button (click)="name1.reverse()">Reverse Name</button>

<h1>Hello {{ name2.yelled() }}!</h1>
<button (click)="name2.set('Bilbo')">Change Name</button>
<button (click)="name2.reverse()">Reverse Name</button>

<button (click)="resetAll$.next()">Reset All</button>
```

[StackBlitz](https://stackblitz.com/edit/angular-ivy-jwt8jh?file=src%2Fapp%2F5-observable-sources.component.ts)

## A smooth path to derived events

RxJS is the only way to smoothly scale to complex event-driven features.

StateAdapt sources extend RxJS observables, and StateAdapt stores directly reference RxJS observables and react to them:

```ts
export class NameComponent {

  // ...

  // [!code --:1]
  name1 = adapt('Bob', {
  // [!code ++:1]
  name1 = adapt('Loading...', {
    adapter: this.nameAdapter,
    sources: { reset: this.resetAll$ }, // [!code --]
    // [!code ++:4]
    sources: {
      set: of('Bob').pipe(delay(3000)), // Any observable
      reset: this.resetAll$,
    },
  });
  // [!code --:1]
  name2 = adapt('Kat', {
  // [!code ++:1]
  name2 = adapt('Loading...', {
    adapter: this.nameAdapter,
    sources: { reset: this.resetAll$ }, // [!code --]
    // [!code ++:4]
    sources: {
      set: of('Kat').pipe(delay(3000)), // Any observable
      reset: this.resetAll$,
    },
  });
}
```

Result:

```ts
export class NameComponent {
  nameAdapter = createAdapter<string>()({
    reverse: name => name.split('').reverse().join(''),
    selectors: {
      yelled: name => name.toUpperCase(),
    },
  });

  resetAll$ = source();

  name1 = adapt('Bob', {
    adapter: this.nameAdapter,
    sources: { reset: this.resetAll$ },
  });
  name2 = adapt('Kat', {
    adapter: this.nameAdapter,
    sources: { reset: this.resetAll$ },
  });
}
```

```html
<h1>Hello {{ name1.yelled() }}!</h1>
<button (click)="name1.set('Bilbo')">Change Name</button>
<button (click)="name1.reverse()">Reverse Name</button>

<h1>Hello {{ name2.yelled() }}!</h1>
<button (click)="name2.set('Bilbo')">Change Name</button>
<button (click)="name2.reverse()">Reverse Name</button>

<button (click)="resetAll$.next()">Reset All</button>
```

## Automatic State Lifecycle and Unsubscriptions

For state to be fully reactive, it cannot rely on any external control code, including initialization and cleanup code.

StateAdapt stores know when they are being used, and automatically initialize and cleanup their state.

In components (and services provided directly in components), the lifecycle of stores is exactly what you would expect: it matches the injector the stores are created with,
so when the component is created, the store activates and subscribes to sources, and when the component is destroyed, the store unsubscribes and clears.

In shared services with `providedIn: 'root'`, the store is initialized when a signal is read or a selector observable is subscribed to:

```ts
@Injectable({
  providedIn: 'root',
})
export class SharedService {
  name = adapt('Loading...', {
    sources: of('Bob').pipe(delay(3000)),
  });

  constructor() {
    setTimeout(() => {
      this.name.state$.pipe(takeUntil(timer(2000))).subscribe(name => {
        console.log('Name is', name);
      });
    }, 5000);
  }
}
```

In that service, the store does nothing until its `state$` observable is subscribed to, at which point it initializes and subscribes to its source observables until `takeUntil(timer(2000))` completes.
At that point, it cleans itself up and unsubscribes from `of('Bob').pipe(delay(3000))`, so the state is never set to `'Bob'`.

Similarly, when any its signals are read, it initializes and subscribes to its source observables:

```ts
  constructor() {
    effect(() => {
      console.log('Will log `Loading...` and then `Bob`:', this.name());
    })
  }
```

In this case, however, the store will never be destroyed, because the effect will listen forever.

StateAdapt stores emit a harmless ping on their main signal every 1000 ms to determine if any effects are still listening—if there are none, state is torn down.
