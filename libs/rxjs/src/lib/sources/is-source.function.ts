import { isObservable } from 'rxjs';

export function isSource(thing: unknown) {
  return Array.isArray(thing) || isObservable(thing);
}
