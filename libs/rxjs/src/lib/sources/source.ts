import { Subject } from 'rxjs';
import { Action } from '@state-adapt/core';

type SubjectWithoutNext = new <K>() => {
  [P in Exclude<keyof Subject<K>, 'next'>]: Subject<K>[P];
};

const SubjectWithoutNext: SubjectWithoutNext = Subject;

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
