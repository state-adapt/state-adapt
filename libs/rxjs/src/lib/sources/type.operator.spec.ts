import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { source } from './source.function';
import { type } from './type.operator';

describe('type', () => {
  function setup() {
    return { onInterval: interval(3000), onClick: source() };
  }

  it('should set the tag after an observable chain', () => {
    const { onInterval } = setup();
    const onInterval2 = onInterval.pipe(
      map(a => a * 2),
      type('asdf'),
    );
    expect((onInterval2 as any).type).toBe('asdf');
  });

  it('should maintain the same reference', () => {
    const { onInterval, onClick } = setup();
    const onInterval2 = onInterval.pipe(
      map(a => a * 2),
      type('asdf'),
    );
    expect(onInterval2).not.toBe(onInterval);
    const onInterval3 = onInterval.pipe(type('asdf'));
    expect(onInterval).toBe(onInterval3);

    // const onClick2 = onClick.pipe(type('asdf'));
    const onClick2 = ((onClick as any).type = 'asdf' && onClick);
    expect(onClick).toBe(onClick2);
  });
});
