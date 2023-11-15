import { createAdapter } from './create-adapter.function';

describe('createAdapter', () => {
  it('should create an adapter with basic reactions', () => {
    const adapter = createAdapter<number>()({});
    expect(adapter).toBeTruthy();

    const state = 1;
    const payload = 4;
    const initialState = 0;
    expect(adapter.set(state, payload)).toBe(payload);
    expect(adapter.reset(state, undefined, initialState)).toBe(initialState);

    const checkTypes = () => {
      // @ts-expect-error Should expect number as payload
      const a: number = adapter.set(1, '1');
      // @ts-expect-error Should expect return to be number
      const b: string = adapter.set(1, 1);

      const c: number = adapter.selectors.state(1);
    };
  });

  it('should create an adapter with reactions', () => {
    const adapter = createAdapter<number>()({
      double: state => state * 2,
    });
    expect(adapter).toBeTruthy();

    const checkTypes = () => {
      // @ts-expect-error Should expect number as payload
      const a: number = adapter.double(1, '1');
      // @ts-expect-error Should expect return to be number
      const b: string = adapter.double(1, 1);
    };
  });

  it('should create an adapter with selectors', () => {
    const adapter = createAdapter<string>()({
      selectors: {
        firstWord: state => state.split('')[0],
      },
    });
    expect(adapter).toBeTruthy();

    const checkTypes = () => {
      // @ts-expect-error Should expect payload to be string
      const a: string = adapter.selectors.firstWord(1);
      // @ts-expect-error Should expect return to be string
      const b: number = adapter.selectors.firstWord('1');
    };
  });
});
