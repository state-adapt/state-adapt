import { concat, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Action, getAction } from '@state-adapt/core';

/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `catchErrorSource`

  `catchErrorSource` is a custom RxJS [operator](https://rxjs.dev/guide/operators) that converts an RxJS [Observable](https://rxjs.dev/guide/observable)
  of any values into a source of errors, using RxJS' [catchError](https://rxjs.dev/api/operators/catchError) operator.
  It takes one argument, {@link TypePrefix}, and prefixes it to create an object of type {@link Action}<any, \`${{@link TypePrefix}}.error$\`>.

  #### Example: Catching errors from a source

  ```typescript
  import { timer, map } from 'rxjs';
  import { toSource } from '@state-adapt/rxjs';

  const timer$ = timer(1000).pipe(
    map(n => n.fakeNumberMethod()),
    toSource('timer$'),
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
    source$.pipe(catchError((err, caught) => concat(of(getAction(`${typePrefix}.error$`, err)), caught)));
}
