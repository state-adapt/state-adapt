import { Observable } from 'rxjs';
import { Action } from '@state-adapt/core';
import { toRequestSource } from './to-request-source.operator';
import { splitRequestSources } from './split-request-sources.function';

/**
  `getRequestSources` takes in a {@link TypePrefix} and an [Observable](https://rxjs.dev/guide/observable)
  of values of type {@link Payload} (inferred) and returns an object with `success$` and `error$` propeties.

  The `success$` property is an observable of values of type

  ```ts
  { type: `${TypePrefix}.success$`; payload: Payload }
  ```

  The `error$` property is an observable of values of type

  ```ts
  { type: `${TypePrefix}.error$`; payload: any }
  ```

  `getRequestSources` combines the functionality of {@link toRequestSource} and {@link splitRequestSources}.

  Important: RxJS streams complete immediately after they error. For simple HTTP requests, this is fine.
  But if you need to keep a stream alive, look into using {@link toRequestSource} and {@link splitRequestSources}
  directly.

  #### Example: Split an HTTP source into success$ and error$ sources

  ```typescript
  import { ajax } from 'rxjs/ajax';
  import { getRequestSources } from '@state-adapt/rxjs';

  const http$ = ajax('https://jsonplaceholder.typicode.com/todos/1');

  const todoRequest = getRequestSources('todo', http$);

  todoRequest.success$.subscribe(console.log);
  // { type: 'todo.success$', payload: { ... } }

  todoRequest.error$.subscribe(console.log);
  // { type: 'todo.error$', payload: { ... } }
  ```

  #### Example: Convert any observable into success$ and error$ sources

  ```typescript
  import { interval, map } from 'rxjs';
  import { getRequestSources } from '@state-adapt/rxjs';

  const interval$ = interval(1000).pipe(
    map(n => n !== 2 ? n : (n as any).fakeNumberMethod()),
  );

  const { success$, error$ } = getRequestSources('interval', interval$);

  success$.subscribe(console.log);
  // { type: 'interval.success$', payload: 0 }
  // { type: 'interval.success$', payload: 1 }
  // Will not log anymore, after error

  error$.subscribe(console.log);
  // { type: 'interval.error$', payload: 'Error: n.fakeNumberMethod is not a function' }
  ```

 */
export function getRequestSources<TypePrefix extends string, Payload>(
  typePrefix: TypePrefix,
  obs$: Observable<Payload>,
): {
  success$: Observable<Action<Payload, `${TypePrefix}.success$`>>;
  error$: Observable<Action<any, `${TypePrefix}.error$`>>;
} {
  const requestSources = obs$.pipe(toRequestSource(typePrefix));
  return splitRequestSources(typePrefix, requestSources);
}
