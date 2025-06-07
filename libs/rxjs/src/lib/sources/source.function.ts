import { Subject } from 'rxjs';

/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `source`

  `source` returns an object that extends an RxJS [Subject](https://rxjs.dev/guide/subject) with an extra `type: string` property, and is also callable directly.
  When using a `source`, you can provide a `type` argument, which will appear as the action type in Redux DevTools:

  ![Action Type in Redux Devtools](https://state-adapt.github.io/assets/devtools-add$.png)

  In the future we want to add a build step to add this annotation automatically. That is why source types are optional.

  #### Example: Creating a source without a type

  ```typescript
  import { source } from '@state-adapt/rxjs';

  const add$ = source<number>();

  add$.subscribe(console.log);

  add$.next(1);
  // 1

  add$(2)
  // 2
  ```

  #### Example: Creating a source with a type
  ```typescript
  const add$ = source<number>('add$');
  ```

  #### Example: Creating a source with onEvent naming convention
  ```typescript
  import { source } from '@state-adapt/rxjs';

  const onAdd = source<number>();

  onAdd.subscribe(console.log);

  onAdd(1)
  // 1
  ```
 */
export function source<T>(type = '') {
  const subject = new Subject<T>();

  const onEvent = function (payload: T): void {
    onEvent.next(payload);
  } as any;

  onEvent.type = type;
  onEvent.prototype.name = type;

  onEvent.next = function (payload: T): void {
    subject.next(payload);
  };
  onEvent.subscribe = subject.subscribe.bind(subject);
  onEvent.complete = subject.complete.bind(subject);
  onEvent.error = subject.error.bind(subject);
  onEvent.pipe = subject.pipe.bind(subject);
  onEvent.lift = subject.lift.bind(subject);

  return onEvent as SourceFn<T>;
}

export type SourceFn<T> = (unknown extends T ? () => void : (payload: T) => void) &
  Subject<T>;
