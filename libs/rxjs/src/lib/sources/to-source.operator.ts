import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Action } from '@state-adapt/core';

/**
  `toSource` is a custom RxJS [operator](https://rxjs.dev/guide/operators) that converts an RxJS [Observable](https://rxjs.dev/guide/observable)
  of values of type {@link Payload} (inferred) into an observable of values of type {@link Action}<{@link Payload}, {@link Type}>.
  It takes one argument, `type`, which is the `type` property of the {@link Action} objects that will be emitted, and which will
  appear as the action type in Redux DevTools:

  ![Action Type in Redux Devtools](https://state-adapt.github.io/assets/devtools-timer$.png)

  #### Example: Converting an observable into a source

  ```typescript
  import { timer } from 'rxjs';
  import { toSource } from '@state-adapt/rxjs';

  const timer$ = timer(1000).pipe(toSource('timer$'));

  timer$.subscribe(console.log);
  // { type: 'timer$', payload: 0 }
  ```
 */
export function toSource<Payload, Type extends string = ''>(type: Type = '' as Type) {
  return (source$: Observable<Payload>): Observable<Action<Payload, Type>> => {
    const sourceWithType$ = source$.pipe(map(payload => ({ type, payload })));
    return sourceWithType$ as Observable<Action<Payload, Type>>;
  };
}
