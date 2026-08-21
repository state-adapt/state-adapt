import { counterAdapter } from './counter.adapter';

const select = <K extends keyof typeof counterAdapter.selectors>(
  name: K,
  s: number,
) => (counterAdapter.selectors[name] as any)(s);

describe('counterAdapter reactions', () => {
  it('increments by the step', () => {
    expect(counterAdapter.increment(0, 1)).toBe(1);
    expect(counterAdapter.increment(10, 5)).toBe(15);
  });

  it('decrements by the step, below zero if asked', () => {
    expect(counterAdapter.decrement(3, 1)).toBe(2);
    expect(counterAdapter.decrement(0, 5)).toBe(-5);
  });

  it('doubles', () => {
    expect(counterAdapter.double(3)).toBe(6);
    expect(counterAdapter.double(0)).toBe(0);
    expect(counterAdapter.double(-4)).toBe(-8);
  });

  it('negates', () => {
    expect(counterAdapter.negate(3)).toBe(-3);
    expect(counterAdapter.negate(-3)).toBe(3);
  });

  it('resets to the initial state it was given', () => {
    expect(counterAdapter.reset(99, undefined as void, 10)).toBe(10);
  });
});

describe('counterAdapter selectors', () => {
  it('derives parity', () => {
    expect(select('isEven', 4)).toBe(true);
    expect(select('isEven', 5)).toBe(false);
    expect(select('parity', 4)).toBe('even');
    expect(select('parity', 5)).toBe('odd');
  });

  it('treats zero as even', () => {
    expect(select('parity', 0)).toBe('even');
  });

  it('derives parity for negative numbers', () => {
    expect(select('parity', -4)).toBe('even');
    expect(select('parity', -3)).toBe('odd');
  });

  it('flags negatives', () => {
    expect(select('isNegative', -1)).toBe(true);
    expect(select('isNegative', 0)).toBe(false);
    expect(select('isNegative', 1)).toBe(false);
  });
});
