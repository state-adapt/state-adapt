import { signal } from '@angular/core';

// ...

export class Component {
  count = signal(0);

  increment() {
    this.count.update(prevCount => prevCount + 1);
  }

  decrement() {
    this.count.update(prevCount => prevCount - 1);
  }
}
