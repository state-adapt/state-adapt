import { Subject } from 'rxjs';
import { Action } from '@state-adapt/core';

type SubjectWithoutNext = new <K>() => {
  [P in Exclude<keyof Subject<K>, 'next'>]: Subject<K>[P];
};

const SubjectWithoutNext: SubjectWithoutNext = Subject;

/**
  ## ![StateAdapt](https://miro.medium.com/max/4800/1*qgM6mFM2Qj6woo5YxDMSrA.webp|width=14) `Source`

  `Source` extends RxJS' [Subject](https://rxjs.dev/guide/subject) with an extra `type: string` property, and is used to create a stream of {@link Action} objects.
  When creating a source, you must provide a `type` argument, which will be the `type` property of the {@link Action} objects that will be emitted, and which will
  appear as the action type in Redux DevTools:

  ![Action Type in Redux Devtools](https://state-adapt.github.io/assets/devtools-add$.png)

  #### Example: Creating a source

  ```typescript
  import { Source } from '@state-adapt/rxjs';

  const add$ = new Source<number>('add$');

  add$.subscribe(action => console.log(action));
  add$.next(1);
  // { type: 'add$', payload: 1 }
  ```
 */
export class Source<T> extends SubjectWithoutNext<Action<T>> {
  type: string;

  constructor(type: string) {
    super();
    this.type = type;
  }
  next(payload: T): void {
    Subject.prototype.next.call(this, { type: this.type, payload });
  }
}
