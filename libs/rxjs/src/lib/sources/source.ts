import { Subject } from 'rxjs';
import { Action } from '@state-adapt/core';
import { source } from './source.function';

type SubjectWithoutNext = new <K>() => {
  [P in Exclude<keyof Subject<K>, 'next'>]: Subject<K>[P];
};

const SubjectWithoutNext: SubjectWithoutNext = Subject;

/**
 * @deprecated Use {@link source} instead.
 */
export class Source<T> extends SubjectWithoutNext<Action<T>> {
  type: string;

  constructor(type = '') {
    super();
    this.type = type;
  }
  next(payload: T): void {
    Subject.prototype.next.call(this, { type: this.type, payload });
  }
}
