import { adapt } from './adapt.function';
import { createStateAdapt } from './create-state-adapt.function';

describe('callable React stores', () => {
  it('adds callable state and selector readers', () => {
    const count = adapt(2, {
      adapter: {
        selectors: {
          double: state => state * 2,
        },
      },
    });

    expect(count()).toBe(2);
    expect(count.state()).toBe(2);
    expect(count.double()).toBe(4);
  });

  it('adds callable readers to stores from a custom StateAdapt instance', () => {
    const stateAdapt = createStateAdapt({ devtools: null });
    const count = stateAdapt.adapt(2, {
      adapter: {
        selectors: {
          double: state => state * 2,
        },
      },
    });

    expect(count()).toBe(2);
    expect(count.double()).toBe(4);
  });
});

describe('callable React store types', () => {
  it('infers the state in reactions and selectors', () => {
    const count = adapt(5, {
      double: state => state * 2,
      selectors: { doubled: s => s * 2 },
    });

    expect(count()).toBe(5);
    expect(count.doubled()).toBe(10);

    const checkTypes = () => {
      count.double();
      count.set(4);
      // @ts-expect-error Should take number as payload
      count.set('4');
      // @ts-expect-error Reader should return number
      const doubled: string = count.doubled();
    };
  });

  it('infers the state inside an inline adapter', () => {
    const store = adapt(
      { selected: 1, unrelated: 1 },
      { adapter: { selectors: { selected: value => value.selected } } },
    );

    expect(store.selected()).toBe(1);

    const checkTypes = () => {
      store.set({ selected: 2, unrelated: 2 });
      // @ts-expect-error Should take { selected: number; unrelated: number }
      store.set({ selected: '2', unrelated: 2 });
      // @ts-expect-error Reader should return number
      const selected: string = store.selected();
    };
  });

  it('infers the state for a custom StateAdapt instance', () => {
    const stateAdapt = createStateAdapt({ devtools: null });
    const count = stateAdapt.adapt(5, { selectors: { doubled: s => s * 2 } });

    expect(count.doubled()).toBe(10);

    const checkTypes = () => {
      count.set(4);
      // @ts-expect-error Should take number as payload
      count.set('4');
    };
  });
});
