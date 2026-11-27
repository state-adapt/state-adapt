# @state-adapt/angular

Angular integration with signals, providers, and injectable adapters.

## Getting Started

```sh
npm install @state-adapt/angular
```

Create a store in an Angular component and read its state as a signal:

```ts
import { Component } from '@angular/core';
import { adapt } from '@state-adapt/angular';

@Component({
  selector: 'app-counter',
  template: `
    <p>{{ count() }}</p>
    <button (click)="count.set(count() + 1)">Increment</button>
  `,
})
export class CounterComponent {
  readonly count = adapt(0);
}
```

For advanced configuration, see [`provideStore`](https://state-adapt.github.io/api/angular/index/provideStore)
and [`IS_STORE_LOCAL`](https://state-adapt.github.io/api/angular/index/IS_STORE_LOCAL).

[StackBlitz Starter](https://stackblitz.com/edit/stackblitz-starters-cbqmmdaw?file=src%2Fapp%2Fcounter.component.ts)

## Peer dependencies

If you install peer dependencies manually, also install `rxjs` and
`@state-adapt/core` and `@state-adapt/rxjs` at the same version as this package.
