import { Observable } from 'rxjs';
import { Action } from '@state-adapt/core';
import { toSource } from './to-source.operator';
import { catchErrorSource } from './catch-error-source.operator';

/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `toRequestSource`

  `toRequestSource` takes in a {@link TypePrefix} and converts an RxJS [Observable](https://rxjs.dev/guide/observable)
  of values of type {@link Payload} (inferred) into an [Observable](https://rxjs.dev/guide/observable) of values of type

  ```ts
  | { type: `${TypePrefix}.success$`; payload: Payload }
  | { type: `${TypePrefix}.error$`; payload: any }
  ```

  #### Example: Convert an HTTP POST observable into an observable with `success$` and `error$` values

  ```typescript
  import { exhaustMap } from 'rxjs';
  import { ajax } from 'rxjs/ajax';
  import { toRequestSource } from '@state-adapt/rxjs';

  const deleteTodo$ = source<number>();

  const deleteTodoRequest$ = deleteTodo$.pipe(
    exhaustMap((id) =>
      ajax({
        url: `https://jsonplaceholder.typicode.com/todos/${id}`,
        method: 'DELETE',
      }).pipe(toRequestSource('todo.delete'))
    )
  );

  deleteTodoRequest$.subscribe(console.log);

  deleteTodo$.next(1);
  // { type: 'todo.delete.success$', payload: AjaxResponse{…} }

  deleteTodo$.next(Infinity);
  // { type: 'todo.delete.error$', payload: 'AjaxErrorImpl{…} }

  deleteTodo$.next(2);
  // { type: 'todo.delete.success$', payload: AjaxResponse{…} }
  ```

  The main stream is not killed because `toRequestSource` operates on the request observable
  instead of the outer observable.

  #### Example: Converting any observable into a request source

  ```typescript
  import { interval } from 'rxjs';
  import { toRequestSource } from '@state-adapt/rxjs';

  const interval$ = interval(1000).pipe(
    map(n => n < 2 ? n : n.fakeNumberMethod()),
    toRequestSource('interval'),
  );

  interval$.subscribe(console.log);
  // { type: 'interval.success$', payload: 0 }
  // { type: 'interval.success$', payload: 1 }
  // { type: 'interval.error$', payload: 'Error: n.fakeNumberMethod is not a function' }
  // End
  ```

  The main stream is killed because `toRequestSource` operates directly on it
  instead of on an inner observable.

 */
export function toRequestSource<Payload, TypePrefix extends string>(
  typePrefix: TypePrefix,
) {
  return (
    source$: Observable<Payload>,
  ): Observable<
    Action<Payload, `${TypePrefix}.success$`> | Action<any, `${TypePrefix}.error$`>
  > => source$.pipe(toSource(`${typePrefix}.success$`), catchErrorSource(typePrefix));
}
