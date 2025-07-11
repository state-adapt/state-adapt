import { Observable } from 'rxjs';

/**
  `type` is a custom RxJS [operator](https://rxjs.dev/guide/operators) that mutates an RxJS [Observable](https://rxjs.dev/guide/observable)
  by setting a `type` property. It takes one argument, which will appear as the action type in Redux DevTools:

  ![Action Type in Redux Devtools](https://state-adapt.github.io/assets/devtools-timer$.png)

  #### Example: Converting an observable into a source

  ```typescript
  import { timer } from 'rxjs';
  import { type } from '@state-adapt/rxjs';

  const timer$ = timer(1000).pipe(type('timer$'));

  timer$.subscribe(console.log);
  // 0
  ```
 */
export function type(type: string) {
  return function <T>(source$: Observable<T>) {
    (source$ as any).type = type;
    return source$;
  };
}
