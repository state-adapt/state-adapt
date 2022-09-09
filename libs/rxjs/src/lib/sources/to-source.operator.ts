import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function toSource<T, K extends string>(type: K) {
  return (source$: Observable<T>) =>
    source$.pipe(map(payload => ({ type, payload })));
}
