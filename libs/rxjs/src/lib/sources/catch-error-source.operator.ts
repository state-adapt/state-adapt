import { concat, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Action, getAction } from '@state-adapt/core';

/**
  `catchErrorSource` is a custom RxJS [operator](https://rxjs.dev/guide/operators) that converts an RxJS [Observable](https://rxjs.dev/guide/observable)
  of any values into a source of errors, using RxJS' [catchError](https://rxjs.dev/api/operators/catchError) operator.
  It takes one argument, {@link TypePrefix}, and prefixes it to create an object of type {@link Action}<any, ${{@link TypePrefix}}.error$>.

  #### Example: Catching errors from a source

  ```typescript
  import { timer, map } from 'rxjs';

  const timer$ = timer(1000).pipe(
    map(n => ({ type: 'timer$', payload: n.fakeNumberMethod() })),
    catchErrorSource('timer'),
  );

  timer$.subscribe(console.log);
  // { type: 'timer.error$', payload: 'Error: n.fakeNumberMethod is not a function' }
  ```
 */
export function catchErrorSource<Payload, TypePrefix extends string>(
  typePrefix: TypePrefix,
) {
  return (
    source$: Observable<Payload>,
  ): Observable<Payload | Action<any, `${TypePrefix}.error$`>> =>
    source$.pipe(catchError(err => of(getAction(`${typePrefix}.error$`, err))));
}
