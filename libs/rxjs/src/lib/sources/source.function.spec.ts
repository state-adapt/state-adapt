import { isObservable } from 'rxjs';
import { map } from 'rxjs/operators';
import { source } from './source.function';

describe('source', () => {
  it('should expect number payload', () => {
    const onClicko = source<number>('CLICKO');
    let result = 0;
    onClicko.subscribe(payload => (result = payload));
    onClicko(4);
    expect(result).toBe(4);
    // @ts-expect-error Payload should be a number
    onClicko('4');
  });

  it('should handle regular .next()', () => {
    const onClicko = source<number>('CLICKO');
    let result = 0;
    onClicko.subscribe(payload => (result = payload));
    onClicko.next(4);
    expect(result).toBe(4);
  });

  it('should default to void', () => {
    const onClicko = source('CLICKO');
    let result = 0;
    onClicko.subscribe(() => (result = 4));
    onClicko();
    expect(result).toBe(4);
    // @ts-expect-error Payload should be void
    onClicko(4);
  });

  it('should allow RxJS operators', () => {
    const onClicko = source<number>('CLICKO');
    let result = 0;
    onClicko.pipe(map(n => n * 2)).subscribe(payload => (result = payload));
    onClicko(4);
    expect(result).toBe(8);
  });

  it('should be recognized by RxJS as an observable', () => {
    const onClicko = source<number>('CLICKO');

    expect(isObservable(onClicko)).toBe(true);
  });
});
