import { Observable } from 'rxjs';
import { map, pairwise, startWith } from 'rxjs/operators';

export function mapEachWithEffect<T, U>(
  input$: Observable<T[]>,
  fn: (value: T) => [U, () => void] | [U],
): Observable<U[]> {
  const cache = new Map<T, [U, () => void] | [U]>();

  return input$.pipe(
    startWith([] as T[]),
    pairwise(),
    map(([prev, next]) => {
      prev.forEach(value => {
        if (!next.includes(value)) {
          const [_, destroy] = cache.get(value)!;
          destroy?.();
          cache.delete(value);
        }
      });

      return next.map(value => {
        if (!cache.has(value)) {
          const results = fn(value);
          cache.set(value, results);
          return results[0];
        } else {
          return cache.get(value)![0];
        }
      });
    }),
  );
}
