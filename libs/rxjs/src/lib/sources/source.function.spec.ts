import { isObservable } from 'rxjs';
import { map } from 'rxjs/operators';
import { source } from './source.function';

describe('source', () => {
  it('should expect number payload', () => {
    const onClick = source<number>('CLICKO');
    let result = 0;
    onClick.subscribe(payload => (result = payload));
    onClick(4);
    expect(result).toBe(4);
    // @ts-expect-error Payload should be a number
    onClick('4');
  });

  it('should handle regular .next()', () => {
    const onClick = source<number>('CLICKO');
    let result = 0;
    onClick.subscribe(payload => (result = payload));
    onClick.next(4);
    expect(result).toBe(4);
  });

  it('should default to void', () => {
    const onClick = source('CLICKO');
    let result = 0;
    onClick.subscribe(() => (result = 4));
    onClick();
    expect(result).toBe(4);
    // @ts-expect-error Payload should be void
    onClick(4);
  });

  it('should allow RxJS operators', () => {
    const onClick = source<number>('CLICKO');
    let result = 0;
    onClick.pipe(map(n => n * 2)).subscribe(payload => (result = payload));
    onClick(4);
    expect(result).toBe(8);
  });

  it('should be recognized by RxJS as an observable', () => {
    const onClick = source<number>('CLICKO');

    expect(isObservable(onClick)).toBe(true);
  });
});
